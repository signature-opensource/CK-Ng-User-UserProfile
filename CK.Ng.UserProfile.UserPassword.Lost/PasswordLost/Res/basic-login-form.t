create <html> transformer
begin
    inject """

           <a class="ck-password-lost-link" routerLink="/auth/password-lost">{{ 'CK.Auth.PasswordLost.Link' | translate }}</a>

           """ into <PasswordLost>;
end

create <ts> transformer
begin
    ensure import { RouterLink } from '@angular/router';

    in after "@Component"
        in first {^braces}
            in after "imports:"
                in first {^[]}
                    replace "TranslateModule" with "TranslateModule, RouterLink";
end
