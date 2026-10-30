using CK.Core;
using Microsoft.AspNetCore.DataProtection;
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
// This application is its own AuthCenter (its "Local" allows the "AuthCenter" feature, see appsettings.json) and its
// HTTP front: the session commands on "/.cris/auth", the other commands on "/.cris".
builder.Services.AddDataProtection();
builder.Services.AddCrisAuthentication();

var map = StObjContextRoot.Load( Assembly.GetExecutingAssembly(), builder.GetBuilderMonitor() );

var cs = builder.Configuration["ConnectionStrings:UserProfileSampleDB"];
if( cs is not null )
{
    map!.StObjs.Obtain<SqlDefaultDatabase>()!.ConnectionString = cs;
}

var app = builder.CKBuild( map );

app.UseRouting();
app.UseCors( c => c.SetIsOriginAllowed( host => true )
                   .AllowAnyMethod()
                   .AllowAnyHeader()
                   .AllowCredentials() );
app.UseAuthorization();
app.UseStaticFiles();
app.UseCrisAuthentication();
app.UseCris();
app.UseSpa( ( b ) =>
{
    if( builder.Environment.IsDevelopment() )
    {
        b.UseProxyToSpaDevelopmentServer( "http://localhost:4200" );
    }
} );

await app.RunAsync();
