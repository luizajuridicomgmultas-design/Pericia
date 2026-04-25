import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Método não permitido",
    });
  }

  try {
    const { fileName, pdfBase64, userName } = req.body;

    if (!fileName || !pdfBase64 || !userName) {
      return res.status(400).json({
        error: "Dados incompletos",
      });
    }

    if (
      !process.env.EMAIL_USER ||
      !process.env.EMAIL_PASS ||
      !process.env.EMAIL_TO
    ) {
      return res.status(500).json({
        error: "Variáveis da Vercel não configuradas",
      });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER.trim(),
        pass: process.env.EMAIL_PASS.trim(),
      },
    });

    await transporter.verify();

    await transporter.sendMail({
      from: `"Perícia Médica App" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO,
      subject: `Requerimento de Perícia Médica - ${userName}`,
      text: `Segue em anexo o requerimento de perícia médica de ${userName}.`,
      attachments: [
        {
          filename: fileName,
          content: pdfBase64,
          encoding: "base64",
        },
      ],
    });

    return res.status(200).json({
      success: true,
    });

  } catch (error) {
    console.error("ERRO SMTP:", error);

    return res.status(500).json({
      error: error.message || "Erro ao enviar email",
    });
  }
}