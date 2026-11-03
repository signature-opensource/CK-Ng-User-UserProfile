using CK.Core;
using CK.DB.Actor;
using CK.SqlServer;
using Dapper;

namespace CK.UserProfile.UserPassword.Lost;

/// <summary>
/// The reads of the lost password flow: resolving an e-mail address to the user it identifies (with the names
/// used to personalize the e-mail and the password hash the recovery token is bound to), and the current
/// password hash of a user.
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
    /// CK.DB.Actor.ActorEMail guarantees that the primary address is validated as soon as the user has a validated
    /// one: requiring it refuses only the users that have no validated address at all.
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
                        ,PasswordHash = p.PwdHash
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
    /// Reads the current password hash of a user: a recovery token is valid only while it is the one the token
    /// was issued for.
    /// </summary>
    /// <returns>The password hash, or null when the user has no password.</returns>
    public Task<byte[]?> GetPasswordHashAsync( ISqlCallContext ctx, int userId )
    {
        return ctx[_userTable].QuerySingleOrDefaultAsync<byte[]?>(
            "select PwdHash from CK.tUserPassword where UserId = @UserId and UserId > 1;",
            new { UserId = userId } );
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
        public byte[] PasswordHash { get; init; } = [];
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
