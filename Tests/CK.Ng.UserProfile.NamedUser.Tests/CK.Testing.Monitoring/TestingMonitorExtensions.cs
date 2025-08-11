using CK.Core;
using System.Diagnostics;

namespace CK.Core;

static class TestingMonitorExtensions
{
    public static IDisposable DebuggerBreakOn( this IActivityMonitor monitor, string text )
    {
        var breaker = monitor.Output.RegisterClient( new DebugBreaker( text ) );
        return Util.CreateDisposableAction( () => monitor.Output.UnregisterClient( breaker ) );
    }

    private sealed class DebugBreaker : IActivityMonitorClient
    {
        private string _text;

        public DebugBreaker( string text )
        {
            _text = text;
        }

        public void OnAutoTagsChanged( CKTrait newTrait )
        {
        }

        public void OnGroupClosed( IActivityLogGroup group, IReadOnlyList<ActivityLogGroupConclusion> conclusions )
        {
        }

        public void OnGroupClosing( IActivityLogGroup group, ref List<ActivityLogGroupConclusion>? conclusions )
        {
        }

        public void OnOpenGroup( IActivityLogGroup group ) => HandleData( ref group.Data );

        void HandleData( ref ActivityMonitorLogData data )
        {
            if( data.Text.Equals( _text, StringComparison.OrdinalIgnoreCase ) )
            {
                Debugger.Break();
            }
        }

        public void OnTopicChanged( string newTopic, string? fileName, int lineNumber )
        {
        }

        public void OnUnfilteredLog( ref ActivityMonitorLogData data ) => HandleData( ref data );
    }
}
