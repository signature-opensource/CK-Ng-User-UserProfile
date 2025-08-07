using CK.Core;
using CK.Cris;
using CK.DB.Actor;
using CK.IO.Actor;
using CK.SqlServer;

namespace CK.Ng.UserProfile.NamedUser.Tests;

[RealObject]
public class TestCommandHandler : IRealObject
{
    [IncomingValidator]
    public async ValueTask ValidateUpdateUserCommandAsync( IUpdateUserCommand command, ICrisIncomingValidationContext validationCtx )
    {
        foreach( var cmd in command.Commands )
        {
            await validationCtx.ValidateAsync( cmd.Command );
        }
    }

    [CommandHandler]
    public async Task<IUpdateUserCommandResult> UpdateUserAsync( ISqlTransactionCallContext ctx,
                                                                 IUpdateUserCommand cmd,
                                                                 ICrisCommandContext commandCtx,
                                                                 UserTable table,
                                                                 PocoDirectory pocoDir )
    {
        var result = cmd.CreateResult<IUpdateUserCommandResult>();
        using( var transaction = ctx[table].BeginTransaction() )
        {
            foreach( var batched in cmd.Commands )
            {
                var executedCommand = await commandCtx.ExecuteAsync( batched.Command );

                // upcoming:
                // var executedCommand = await execCmd.SuccessfulCommand;
                // -> throws if not successful
                if( executedCommand.Result is ICrisResultError err )
                {
                    throw new CKException( err.Errors.FirstOrDefault().Text ?? "Error while handling Cris command, missing message." );
                }

                var cmdResult = pocoDir.Create<IPocoCommandExecutedCommandResult>( c => c.Initialize( executedCommand ) );
                result.Results.Add( cmdResult );
            }
            transaction.Commit();
        }

        return result;
    }
}
