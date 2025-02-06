import mjml2html from 'mjml';
import nodemailer from 'nodemailer';
import { verificationEmailTemplate } from './mjmlTemplate.js';

export async function sendVerificationEmail(email, token) {
    console.log("Préparation de l'envoi de l'e-mail de vérification à:", email);
    console.log("Préparation de l'envoi de l'e-mail de :", process.env.EMAIL_USER);
    console.log("Préparation de l'envoi avec le mdp:", process.env.EMAIL_PASSWORD);
    const verificationUrl = `https://game-vite2-i1mtv0vnx-omar-elhadidis-projects.vercel.app/verify?token=${token}`;

    // Utiliser le template depuis emailTemplates.js
    const mjmlTemplate = verificationEmailTemplate(verificationUrl);

    const { html } = mjml2html(mjmlTemplate);

    // Configurer le transporteur d'e-mail ( ICI MAILTRAP)

    // const transporter = nodemailer.createTransport({
    //     host: process.env.HOST,
    //     port: 2525,
    //     auth: {
    //         user: process.env.EMAIL_USER_MAILTRAP,
    //         pass: process.env.EMAIL_PASSWORD_MAILTRAP,
    //     },
    // });

    //Configuration de google
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    // Envoyer l'e-mail
    try {
        await transporter.sendMail({
            // from: 'no-reply@mailtrap.io',
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Vérification de votre compte',
            html: html,
        });
        console.log("E-mail de vérification envoyé à:", email);
    } catch (error) {
        console.error("Erreur lors de l'envoi de l'e-mail:", error);
    }
}
