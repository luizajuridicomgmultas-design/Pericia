import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { fileName, pdfBase64, userName } = req.body;

    await resend.emails.send({
      from: "Perícia App <onboarding@resend.dev>",
      to: "camilapazenge@gmail.com",
      subject: `Requerimento de Perícia Médica - ${userName}`,
      html: `
        <p>Prezados,</p>
        <p>Segue em anexo o formulário de requerimento para perícia médica devidamente preenchido, acompanhado do(s) documento(s) necessário(s).</p>
        <p>Atenciosamente.</p>
      `,
      attachments: [
        {
          filename: fileName,
          content: pdfBase64,
        },
      ],
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao enviar e-mail" });
  }
}