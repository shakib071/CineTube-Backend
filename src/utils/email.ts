/* eslint-disable @typescript-eslint/no-explicit-any */
import status from "http-status";
import nodemailer from "nodemailer";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/AppError";

const transporter = nodemailer.createTransport({
    host : envVars.EMAIL_SENDER.SMTP_HOST,
    secure: true,
    auth: {
        user: envVars.EMAIL_SENDER.SMTP_USER,
        pass: envVars.EMAIL_SENDER.SMTP_PASS
    },
    port: Number(envVars.EMAIL_SENDER.SMTP_PORT)
})

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: {
    filename: string;
    content: Buffer | string;
    contentType: string;
  }[];
}

export const sendEmail = async ({to, subject,html, attachments} : SendEmailOptions) => {
   
    
    try {
        
        
        const info = await transporter.sendMail({
            from: envVars.EMAIL_SENDER.SMTP_FROM,
            to : to,
            subject : subject,
            html : html,
            attachments: attachments?.map((attachment) => ({
                filename: attachment.filename,
                content: attachment.content,
                contentType: attachment.contentType,
            }))
        })

        console.log(`Email sent to ${to} : ${info.messageId}`);
    } catch (error : any) {
        console.log("Email Sending Error", error.message);
        throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to send email");
    }
}