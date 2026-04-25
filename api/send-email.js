import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { fileName, pdfBase64, userName } = req.body;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO,
      subject: `Requerimento de Perícia Médica - ${userName}`,
      text: `Olá, segue em anexo o requerimento de perícia médica de ${userName}.`,
      attachments: [
        {
          filename: fileName,
          content: pdfBase64,
          encoding: "base64",
        },
      ],
    });

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao enviar email" });
  }
}