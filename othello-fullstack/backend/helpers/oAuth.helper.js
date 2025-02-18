import {AuthorizationCode} from "simple-oauth2"
import {  GithubClient, GoogleClient, SpotifyClient } from "../oauth.secrets.js"
import { OAUTH_REDIRECTURL } from "../constants.js";

const generateAuthUri=(provider,scopes)=>{
   
    const state = '';
    const client=new AuthorizationCode(provider)
                const authorizationUri = client.authorizeURL({
                    redirect_uri: OAUTH_REDIRECTURL,
                    scope: scopes,
                    state: state,
                  });
                  return authorizationUri;
}
const registerUserRedirectUri=(provider)=>{
    let scopes;
        switch(provider){
            case "google":
                scopes = 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile';
               return generateAuthUri(GoogleClient,scopes) 
            // case "facebook":
            //     return generateAuthUri(FacebookClient) 
            case "github":
                scopes = ['user', 'user:email'];
                return generateAuthUri(GithubClient,scopes) 
            // case "microsoft":
            //     return generateAuthUri(MicrosoftClient) 
            case "spotify":
                scopes = ['user-read-private', 'user-read-email'];
                return generateAuthUri(SpotifyClient,scopes) 
            default:
                return undefined;
        }
}
export {registerUserRedirectUri}