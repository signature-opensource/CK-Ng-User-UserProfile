using CK.Core;
using CK.DB.Actor;
using CK.SqlServer;
using Dapper;

namespace CK.Ng.UserProfile.UserPassword.Lost;

/// <summary>
/// The single read the lost password flow needs: resolving an e-mail address to the user it
/// identifies, along with the names used to personalize the e-mail.
/// </summary>
public class PasswordLostQueries : IAutoService
{
    readonly UserTable _userTable;

    public PasswordLostQueries( UserTable userTable )
    {
        _userTable = userTable;
    }

    /// <summary>
    /// Resolves a validated primary e-mail address to its user.
    /// <para>
    /// Only a primary and validated address is accepted, mirroring what the "Basic" provider
    /// accepts as a login identifier (see <c>CK.DB.User.UserPassword.EMailLogin</c>): a recovery
    /// link must not be sent to an address that cannot be used to log in.
    /// </para>
    /// <para>
    /// The user must also be a password user: sending a "reset your password" link to an account
    /// that authenticates only through an external provider would be misleading.
    /// </para>
    /// </summary>
    /// <returns>The recipient, or null when the address matches no such user.</returns>
    public Task<PasswordUserByEmail?> FindPasswordUserByEmailAsync( ISqlCallContext ctx, string email )
    {
        return ctx[_userTable].QuerySingleOrDefaultAsync<PasswordUserByEmail?>(
            """
            select top 1 u.UserId
                        ,u.UserName
                        ,FirstName = isnull( u.FirstName, '' )
                        ,LastName = isnull( u.LastName, '' )
              from CK.vUser u
                  inner join CK.tActorEMail e on e.ActorId = u.UserId
                  inner join CK.tUserPassword p on p.UserId = u.UserId
              where e.EMail = @Email
                and e.IsPrimary = 1
                and e.ValTime > '0001-01-01'
                and u.UserId > 1;
            """,
            new { Email = email } );
    }

    /// <summary>
    /// Reads back the primary e-mail and the names of a user, to send the confirmation mail once
    /// the password has been changed.
    /// </summary>
    /// <returns>The recipient, or null when the user has no primary validated e-mail.</returns>
    public Task<PasswordUserById?> FindPasswordUserByIdAsync( ISqlCallContext ctx, int userId )
    {
        return ctx[_userTable].QuerySingleOrDefaultAsync<PasswordUserById?>(
            """
            select top 1 Email = e.EMail
                        ,FirstName = isnull( u.FirstName, '' )
                        ,LastName = isnull( u.LastName, '' )
              from CK.vUser u
                  inner join CK.tActorEMail e on e.ActorId = u.UserId
              where u.UserId = @UserId
                and e.IsPrimary = 1
                and e.ValTime > '0001-01-01';
            """,
            new { UserId = userId } );
    }

    /// <summary>
    /// A user resolved from its e-mail address.
    /// </summary>
    public record PasswordUserByEmail
    {
        public int UserId { get; init; }
        public string UserName { get; init; } = string.Empty;
        public string FirstName { get; init; } = string.Empty;
        public string LastName { get; init; } = string.Empty;
    }

    /// <summary>
    /// The mailing information of a user resolved from its identifier.
    /// </summary>
    public record PasswordUserById
    {
        public string Email { get; init; } = string.Empty;
        public string FirstName { get; init; } = string.Empty;
        public string LastName { get; init; } = string.Empty;
    }
}
