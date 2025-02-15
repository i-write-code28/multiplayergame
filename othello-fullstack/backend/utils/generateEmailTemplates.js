import { APPNAME ,APPURL} from "../constants.js";
export const generateEmailTemplates = (username, token,email="",reason="") => {
    let html;
    switch (reason) {
        case "verify":
            html = `

<body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
    <table width="100%" cellspacing="0" cellpadding="0">
        <tr>
            <td align="center">
                <table width="600px" style="background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0,0,0,0.1);">
                    <tr>
                        <td align="center">
                            <h2 style="color: #333;">Verify Your ${APPNAME} Account</h2>
                            <p style="color: #555;">Hello ${username},</p>
                            <p>Thank you for signing up! Please verify your email by clicking the button below.</p>
                            <a href="${APPURL}/auth/verify/${token}" style="display: inline-block; background: #007bff; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
                            <p>If you didn't create an account, please ignore this email.</p>
                            <p style="color: #777;">- The ${APPNAME} Team</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>

            `;
            break;
        case "forgotPassword":
            html = `
           <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
    <table width="100%" cellspacing="0" cellpadding="0">
        <tr>
            <td align="center">
                <table width="600px" style="background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0,0,0,0.1);">
                    <tr>
                        <td align="center">
                            <h2 style="color: #333;">Reset Your Password</h2>
                            <p style="color: #555;">Hello ${username},</p>
                            <p>We received a request to reset your password. Click the button below to reset it:</p>
                            <a href="${APPURL}/auth/reset-password/${token}" style="display: inline-block; background: #ff5733; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
                            <p>If you didn’t request this, you can safely ignore this email.</p>
                            <p style="color: #777;">- The ${APPNAME} Team</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
            `;
            break;
        case "emailChange":
            html = `
           <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
    <table width="100%" cellspacing="0" cellpadding="0">
        <tr>
            <td align="center">
                <table width="600px" style="background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0,0,0,0.1);">
                    <tr>
                        <td align="center">
                            <h2 style="color: #333;">Your Sign-In Email Was Changed</h2>
                            <p style="color: #555;">Hello ${username},</p>
                            <p>Your email address was successfully changed to **${email}**.</p>
                            <p>If this wasn’t you, please contact our support team immediately.</p>
                            <p style="color: #777;">- The ${APPNAME} Team</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
            `;
            break;
        default:
            html = null;
    }
    return html;
}