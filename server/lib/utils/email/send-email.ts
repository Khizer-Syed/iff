import { NodeMailgun } from 'ts-mailgun';
const mailer = new NodeMailgun();
mailer.apiKey = process.env.MAILGUN_API_KEY;
mailer.domain = process.env.MAILGUN_DOMAIN; // Set the domain you registered earlier
mailer.fromEmail = process.env.ADMIN_EMAIL; // Set your from email
mailer.fromTitle = process.env.MAILGUN_FROM_TITLE;
mailer.init();

export function sendEmail(to: string | string[], cc: string | string[], subject: string, html: string) {
    return mailer.send(to, subject, undefined, undefined, { cc, 'o:tracking': 'False', html })
        .catch((err: Error) => {
            console.log(err);
        });
}
