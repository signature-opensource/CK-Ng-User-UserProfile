using CK.Core;
using Microsoft.AspNetCore.Authentication;
using System.Reflection;

var builder = WebApplication.CreateBuilder( args );
builder.UseCKMonitoring();
builder.AddApplicationIdentityServiceConfiguration();

var monitor = builder.GetBuilderMonitor();
var localePath = $"{builder.Environment.ContentRootPath}\\locales";
monitor.Info( $"Setting Locale translation files path to: {localePath}." );
GlobalizationFileHelper.SetLocaleTranslationFiles( monitor, localePath );
monitor.Info( "Globalization files should have been loaded." );

builder.Services.AddControllers();
builder.Services.AddCors();
builder.Services.AddHttpClient();

var authBuilder = new AuthenticationBuilder( builder.Services );

builder.AddWebFrontAuth( o => {
    o.ExpireTimeSpan = TimeSpan.FromHours( 1 );
    o.SlidingExpirationTime = TimeSpan.FromHours( 1 );
    o.SchemesCriticalTimeSpan = new Dictionary<string, TimeSpan>
    {
        { "Basic", new TimeSpan( 0, 5, 0 ) }
    };
} );

var map = StObjContextRoot.Load( Assembly.GetExecutingAssembly(), builder.GetBuilderMonitor() );

var cs = builder.Configuration["ConnectionStrings:UserProfileSampleDB"];
if( cs is not null )
{
    map!.StObjs.Obtain<SqlDefaultDatabase>()!.ConnectionString = cs;
}

var app = builder.CKBuild( map );

app.UseRouting();
app.UseAuthentication();
app.UseCors( c => c.SetIsOriginAllowed( host => true )
                   .AllowAnyMethod()
                   .AllowAnyHeader()
                   .AllowCredentials() );
app.UseAuthorization();
app.UseStaticFiles();
app.UseCris();
app.UseSpa( ( b ) =>
{
    if( builder.Environment.IsDevelopment() )
    {
        b.UseProxyToSpaDevelopmentServer( "http://localhost:4200" );
    }
} );

await app.RunAsync();
