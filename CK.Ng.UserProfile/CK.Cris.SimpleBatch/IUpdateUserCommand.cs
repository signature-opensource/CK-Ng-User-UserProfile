using CK.Auth;
using CK.Cris;

namespace CK.IO.Actor;

public interface IUpdateUserCommand : ICommand<IUpdateUserCommandResult>, ICommandSimpleBatch, ICommandCurrentCulture, ICommandAuthNormal
{
}

public interface IUpdateUserCommandResult : ISimpleBatchCommandResultPart { }

public interface ITestBatchCommand : ICommand, ICommandSimpleBatch
{
    public IDictionary<string, IAbstractCommand> Test2 { get; }
    public IList<IAbstractCommand> Test3 { get; }
    public ICreateUserCommand Test4 { get; set; }
    public ITestCommand Test5 { get; set; }
}

public interface ITestCommand : ICommand, ICommandSimpleBatch { }
