create <html> transformer
begin
    inject """

           <li nz-menu-item class="ck-user-info-box-menu-item" routerLink="/profile">
               <fa-icon class="icon" [icon]="userIcon"></fa-icon>
               {{ 'CK.UserInfoBox.Profile' | translate }}
           </li>

           """ into <PreUserInfoBoxNormalItems>;
end

create <ts> transformer
begin
    ensure import { RouterLink } from '@angular/router';
    ensure import { faUser } from '@fortawesome/free-regular-svg-icons';

    in after "@Component"
            in first {^braces}
                in after "imports:"
                    in first {^[]}
                        replace "FontAwesomeModule" with "RouterLink, FontAwesomeModule";

    inject """

             protected userIcon = faUser;

           """ into <PreIconsDefinition>;

end
