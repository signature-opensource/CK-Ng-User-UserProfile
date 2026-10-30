using CK.Core;
using CK.Cris;
using CK.DB.Actor;
using CK.IO.Actor;
using CK.SqlServer;

namespace CK.UserProfile;

/// <summary>
/// Handles the <see cref="IUpdateUserCommand"/> of the user profile's update form: its batched commands are executed
/// in order, in the same command context and in one transaction. The first failure throws (the transaction is rolled
/// back); each executed command's result is in the <see cref="IUpdateUserCommandResult"/>.
/// </summary>
[RealObject]
public class UpdateUserCommandHandler : IRealObject
{
    /// <summary>
    /// Executes the batched commands.
    /// </summary>
    /// <param name="ctx">The transaction call context.</param>
    /// <param name="cmd">The batch command.</param>
    /// <param name="table">The user table (its database holds the transaction).</param>
    /// <param name="commandCtx">The command context that executes the batched commands.</param>
    /// <param name="pocoDir">The poco directory.</param>
    /// <returns>The result of the batch.</returns>
    [CommandHandler]
    public async Task<IUpdateUserCommandResult> UpdateUserAsync( ISqlTransactionCallContext ctx,
                                                                 IUpdateUserCommand cmd,
                                                                 UserTable table,
                                                                 ICrisCommandContext commandCtx,
                                                                 PocoDirectory pocoDir )
    {
        var result = cmd.CreateResult<IUpdateUserCommandResult>();
        using( var transaction = ctx[table].BeginTransaction() )
        {
            foreach( var batched in cmd.Commands )
            {
                var executedCommand = await commandCtx.ExecuteAsync( batched.Command );
                if( executedCommand.Result is ICrisResultError err )
                {
                    throw new CKException( err.Errors.FirstOrDefault().Text ?? "Error while handling Cris command, missing message." );
                }
                var cmdResult = pocoDir.Create<IPocoCommandExecutedCommandResult>();
                cmdResult.Initialize( executedCommand );
                result.Results.Add( cmdResult );
            }
            transaction.Commit();
        }
        return result;
    }
}
