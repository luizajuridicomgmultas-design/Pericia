import React, { useState, useEffect } from 'react';

const USERS = {
  maria: {
    nome: "Maria Auxiliadora dos Santos Paz",
    cpf: "892.023.256-34",
    cargo: "Auxiliar de Secretaria Escolar",
    orgao: "SEDUC",
    mat1: "28.757-1",
    unid1: "CEMEI Tropical",
    sit: "Efetivo(a)",
    tel: "(31) 98676-4711",
    email: "maspaz2005@hotmail.com",
  },
  angela: {
    nome: "Angela Maria dos Santos Silva",
    cpf: "691.746.016-87",
    cargo: "Auxiliar de Biblioteca Escolar",
    orgao: "SEDUC",
    mat1: "1620846",
    unid1: "E.M. DONA CORDELINA SILVEIRA MATTOS",
    sit: "Efetivo(a)",
    tel: "(31) 98834-7279",
    email: "angelam.silva@edu.contagem.mg.gov.br",
  },
};

const IconUser = () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconCamera = () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>;
const IconCheck = () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>;
const IconFile = () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const IconSend = () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
const IconTrash = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;

export default function App() {
  const [step, setStep] = useState(1);
  const [user, setUser] = useState(null);
  const [selectedUserKey, setSelectedUserKey] = useState(null);

  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [leaveType, setLeaveType] = useState("01_03");
  const [shift, setShift] = useState("");
  const [acompType, setAcompType] = useState("01_03");
  const [kinship, setKinship] = useState("");

  const [atestadoDoc, setAtestadoDoc] = useState(null);
  const [identidadeDoc, setIdentidadeDoc] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const btnBase = "w-full p-6 text-2xl font-extrabold rounded-2xl transition-all duration-200 text-center flex flex-col items-center justify-center gap-2 shadow-md active:scale-95";
  const btnPrimary = `${btnBase} bg-blue-700 text-white border-4 border-blue-900`;
  const btnSecondary = `${btnBase} bg-white text-slate-800 border-4 border-slate-300`;
  const btnSuccess = `${btnBase} bg-green-700 text-white border-4 border-green-900`;

  useEffect(() => {
    if (!window.PDFLib && !document.querySelector('script[data-pdf-lib="true"]')) {
      const script = document.createElement('script');
      script.src = "https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js";
      script.async = true;
      script.dataset.pdfLib = "true";
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (!selectedUserKey) return;
    const savedId = localStorage.getItem(`saved_identidade_${selectedUserKey}`);
    setIdentidadeDoc(savedId ? JSON.parse(savedId) : null);
  }, [selectedUserKey]);

  const handleFileRead = (e, setter, saveLocal = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const doc = {
        name: file.name || "documento",
        type: file.type || "application/octet-stream",
        dataUrl: event.target.result,
      };
      setter(doc);
      if (saveLocal && selectedUserKey) {
        localStorage.setItem(`saved_identidade_${selectedUserKey}`, JSON.stringify(doc));
      }
    };
    reader.readAsDataURL(file);
  };

  const removeSavedId = () => {
    if (selectedUserKey) localStorage.removeItem(`saved_identidade_${selectedUserKey}`);
    setIdentidadeDoc(null);
  };

  const waitForPDFLib = () => new Promise((resolve, reject) => {
    if (window.PDFLib) return resolve(window.PDFLib);
    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      if (window.PDFLib) {
        clearInterval(timer);
        resolve(window.PDFLib);
      }
      if (tries > 80) {
        clearInterval(timer);
        reject(new Error("Biblioteca de PDF não carregou. Recarregue a página."));
      }
    }, 100);
  });

  const dataUrlToUint8Array = (dataUrl) => {
    const base64 = dataUrl.split(',')[1];
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes;
  };

  const blobToBase64 = (blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  const compressImageDataUrl = (dataUrl, maxWidth = 1500, quality = 0.78) => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const width = Math.round(img.width * scale);
      const height = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });

  const formatDataBR = (dataString) => {
    if (!dataString) return "";
    const [ano, mes, dia] = dataString.split('-');
    return `${dia}/${mes}/${ano}`;
  };



  const formatDataLongBR = (dataString) => {
    if (!dataString) return "";
    const [ano, mes, dia] = dataString.split('-');
    const meses = ["jan.", "fev.", "mar.", "abr.", "mai.", "jun.", "jul.", "ago.", "set.", "out.", "nov.", "dez."];
    return `${Number(dia)} de ${meses[Number(mes) - 1]} de ${ano}`;
  };

  const splitData = (dataString) => {
    const [ano, mes, dia] = dataString.split('-');
    return { dia, mes, ano, completa: `${dia}/${mes}/${ano}` };
  };

  const safeDraw = (page, text, x, y, options = {}) => {
    if (!text) return;
    const { font, size = 8, maxWidth = 170, color } = options;
    let finalText = String(text);
    let finalSize = size;
    if (font) {
      while (font.widthOfTextAtSize(finalText, finalSize) > maxWidth && finalSize > 5.2) {
        finalSize -= 0.25;
      }
    }
    page.drawText(finalText, { x, y, size: finalSize, font, color });
  };

  const markX = (page, x, y, font) => {
    page.drawText('X', { x, y, size: 12, font });
  };

  const fillOfficialForm = async (pdfDoc, pdfLib) => {
    // Este PDF é estático (sem AcroForm). Usamos drawText em coordenadas extraídas
    // via pdfplumber. Sistema de coordenadas pdf-lib: origem canto INFERIOR esquerdo.
    // pdf_y = 841.92 - word.bottom  (onde word.bottom = word.top + font_size)
    const { StandardFonts, rgb } = pdfLib;
    const page = pdfDoc.getPages()[0];
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const black = rgb(0, 0, 0);
    const d = splitData(date);

    const draw = (text, x, y, opts = {}) => {
      if (!text) return;
      const { f = font, size = 7.5, maxW = 200 } = opts;
      let s = size;
      let t = String(text);
      while (f.widthOfTextAtSize(t, s) > maxW && s > 5) s -= 0.2;
      page.drawText(t, { x, y, size: s, font: f, color: black });
    };

    // Marca X dentro de um checkbox (box de 9x9pts)
    const markX = (x, y) => {
      page.drawText('X', { x: x + 1, y: y + 1, size: 7, font: bold, color: black });
    };

    // ── Dados pessoais ──────────────────────────────────────────────
    // Nome completo: label termina ~x110, linha em top=119.8 -> pdf_y~711
    draw(user.nome, 112, 711, { maxW: 305 });
    // CPF: label 'CPF:' em x=429.5 -> texto após x=453
    draw(user.cpf, 453, 711, { maxW: 100 });
    // Cargo: label termina ~x101, top=135.1 -> pdf_y~696
    draw(user.cargo, 101, 696, { maxW: 200 });
    // Órgão: label termina ~x383, top=135.1 -> pdf_y~696
    draw(user.orgao, 383, 696, { maxW: 170 });
    // Mat. 1º cargo: label termina ~x96, top=150.2 -> pdf_y~681
    draw(user.mat1, 96, 681, { maxW: 200 });
    // Unid. 1º cargo: label termina ~x148, top=165.3 -> pdf_y~666
    draw(user.unid1, 148, 666, { maxW: 125 });
    // Telefone: label termina ~x95, top=204.8 -> pdf_y~626
    draw(user.tel, 95, 626, { maxW: 95 });
    // E-mail: label termina ~x228, top=204.8 -> pdf_y~626
    draw(user.email, 228, 626, { maxW: 320 });

    // Situação funcional — checkboxes de 9x9 em top~182
    // Efetivo x0=102.9, Comissionado x0=167.5, Contratado x0=264.2
    if (user.sit === 'Efetivo(a)')      markX(103, 650);
    if (user.sit === 'Comissionado(a)') markX(168, 650);
    if (user.sit === 'Contratado(a)')   markX(265, 649);

    // ── Tipo de perícia ─────────────────────────────────────────────
    // Cada seção tem: checkbox de agendamento (x0=34.9) + Manhã/Tarde + data

    if (leaveType === '01_03') {
      // Checkbox agendamento: box x0=34.9 top=281.5 -> pdf_y=841.92-290.5=551
      markX(35, 551);
      // Data: '____/_____/_____' começa x=283.9 top=279.9 -> pdf_y=841.92-289.9=552
      draw(d.dia, 284, 552, { f: bold, size: 7.5, maxW: 20 });
      draw(d.mes, 307, 552, { f: bold, size: 7.5, maxW: 25 });
      draw(d.ano, 338, 552, { f: bold, size: 7.5, maxW: 35 });
    }

    if (leaveType === '04_15') {
      // Manhã: box x0=370.6 top=331.4 -> pdf_y=841.92-340.4=501.5
      if (shift === 'manha') markX(371, 501);
      // Tarde: box x0=457.1 top=332.6 -> pdf_y=841.92-341.6=500.3
      if (shift === 'tarde') markX(458, 500);
      // Agendamento: box x0=34.9 top=351.4 -> pdf_y=841.92-360.4=481.5
      markX(35, 481);
      // Data: x0=283.9 top=349.7 -> pdf_y=841.92-358.7=483.2
      draw(d.dia, 284, 483, { f: bold, size: 7.5, maxW: 20 });
      draw(d.mes, 307, 483, { f: bold, size: 7.5, maxW: 25 });
      draw(d.ano, 338, 483, { f: bold, size: 7.5, maxW: 35 });
    }

    if (leaveType === 'acima_15') {
      // Manhã: box x0=371.3 top=402.8 -> pdf_y=841.92-411.8=430.1
      if (shift === 'manha') markX(372, 430);
      // Tarde: box x0=456.1 top=403.6 -> pdf_y=841.92-412.6=429.3
      if (shift === 'tarde') markX(457, 429);
      // Agendamento: box x0=34.9 top=422.9 -> pdf_y=841.92-431.9=410
      markX(35, 410);
      // Data: x0=283.9 top=421.3 -> pdf_y=841.92-430.3=411.6
      draw(d.dia, 284, 412, { f: bold, size: 7.5, maxW: 20 });
      draw(d.mes, 307, 412, { f: bold, size: 7.5, maxW: 25 });
      draw(d.ano, 338, 412, { f: bold, size: 7.5, maxW: 35 });
    }

    if (leaveType === 'acidente') {
      // Manhã: box x0=373.6 top=445.8 -> pdf_y=841.92-454.8=387.1
      if (shift === 'manha') markX(374, 387);
      // Tarde: box x0=457.1 top=446.3 -> pdf_y=841.92-455.3=386.6
      if (shift === 'tarde') markX(458, 387);
      // Agendamento: box x0=34.9 top=465.0 -> pdf_y=841.92-474=367.9
      markX(35, 368);
      // Data: x0=259.5 top=463.3 -> pdf_y=841.92-472.3=369.6
      draw(d.dia, 260, 370, { f: bold, size: 7.5, maxW: 20 });
      draw(d.mes, 283, 370, { f: bold, size: 7.5, maxW: 25 });
      draw(d.ano, 314, 370, { f: bold, size: 7.5, maxW: 35 });
    }

    if (leaveType === 'acompanhamento') {
      // Acompanhamento checkbox: box x0=34.9 top=487.2 -> pdf_y=841.92-496.2=345.7
      markX(35, 345);
      // Manhã acomp: box x0=370.9 top=487.7 -> pdf_y=841.92-496.7=345.2
      if (shift === 'manha') markX(371, 345);
      // Tarde acomp: box x0=457.9 top=486.8 -> pdf_y=841.92-495.8=346.1
      if (shift === 'tarde') markX(458, 346);
      // Sub-tipo 01_03: box x0=163.4 top=506.9 -> pdf_y=841.92-515.9=326
      if (acompType === '01_03')    markX(164, 326);
      // Sub-tipo acima04: box x0=163.0 top=521.8 -> pdf_y=841.92-530.8=311.1
      if (acompType === 'acima_04') markX(164, 311);
      // Data acomp: '____/_____/_______' x0=174.6 top=536.3 -> pdf_y=841.92-545.3=296.6
      draw(d.dia, 175, 297, { f: bold, size: 7.5, maxW: 20 });
      draw(d.mes, 198, 297, { f: bold, size: 7.5, maxW: 25 });
      draw(d.ano, 229, 297, { f: bold, size: 7.5, maxW: 35 });
      // Parentesco: texto começa após label em x=168 top=550.9 -> pdf_y=841.92-561=280.9
      // label 'acompanhado(a):____' starts at x=168, preenchemos a linha em branco
      draw(kinship, 338, 281, { maxW: 220 });
    }

    // ── Rodapé: CONTAGEM-MG, __/__ /____  (Data) ────────────────────
    // Barras em x=308.1 e x=335.9, top=797.7 -> pdf_y=841.92-807.7=34.2
    // dia antes de 308 -> x=285, mes entre 308-335 -> x=313, ano após 335 -> x=341
    draw(d.dia,  285, 35, { f: bold, size: 8, maxW: 22 });
    draw(d.mes,  313, 35, { f: bold, size: 8, maxW: 22 });
    draw(d.ano,  341, 35, { f: bold, size: 8, maxW: 40 });
  };

  const appendDocumentPages = async (pdfDoc, pdfLib, docFile) => {
    const { PDFDocument } = pdfLib;
    if (!docFile?.dataUrl) return;

    if (docFile.dataUrl.startsWith('data:application/pdf')) {
      const donor = await PDFDocument.load(dataUrlToUint8Array(docFile.dataUrl));
      const copiedPages = await pdfDoc.copyPages(donor, donor.getPageIndices());
      copiedPages.forEach((p) => pdfDoc.addPage(p));
      return;
    }

    const jpegDataUrl = await compressImageDataUrl(docFile.dataUrl, 1600, 0.78);
    const image = await pdfDoc.embedJpg(dataUrlToUint8Array(jpegDataUrl));
    const page = pdfDoc.addPage([595.25, 842]);
    const margin = 28;
    const maxW = page.getWidth() - margin * 2;
    const maxH = page.getHeight() - margin * 2;
    const scale = Math.min(maxW / image.width, maxH / image.height);
    const w = image.width * scale;
    const h = image.height * scale;
    page.drawImage(image, {
      x: (page.getWidth() - w) / 2,
      y: (page.getHeight() - h) / 2,
      width: w,
      height: h,
    });
  };

  const generateAndSharePDF = async () => {
    setIsGenerating(true);
    try {
      if (!user) {
        alert('Selecione a pessoa antes de enviar.');
        return;
      }
      if (!atestadoDoc) {
        alert('Antes de enviar, anexe o atestado.');
        return;
      }
      if (!identidadeDoc) {
        alert('Antes de enviar, salve a identidade desta pessoa.');
        return;
      }

      const pdfLib = await waitForPDFLib();
      const { PDFDocument } = pdfLib;
      const templateResponse = await fetch('/formulario_pericia.pdf');
      if (!templateResponse.ok) throw new Error('Arquivo public/formulario_pericia.pdf não encontrado.');
      const templateBytes = await templateResponse.arrayBuffer();
      const pdfDoc = await PDFDocument.load(templateBytes);

      await fillOfficialForm(pdfDoc, pdfLib);
      await appendDocumentPages(pdfDoc, pdfLib, atestadoDoc);     // Página 2
      await appendDocumentPages(pdfDoc, pdfLib, identidadeDoc);   // Página 3

      const bytes = await pdfDoc.save({ useObjectStreams: true });
      const pdfBlob = new Blob([bytes], { type: 'application/pdf' });
      const fileName = `Requerimento_${user.nome.split(' ')[0]}_${date.replace(/-/g, '')}.pdf`;
      const pdfBase64 = await blobToBase64(pdfBlob);

      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName, pdfBase64, userName: user.nome, userEmail: user.email }),
      });

      const rawText = await response.text();
      let data = {};
      try { data = rawText ? JSON.parse(rawText) : {}; } catch { data = { error: rawText }; }

      if (!response.ok) {
        console.error('Erro da API:', data);
        alert(data.error || 'Erro ao enviar o e-mail. Tente novamente.');
        return;
      }

      alert('E-mail enviado com sucesso!');
      setStep(5);
    } catch (error) {
      console.error(error);
      alert(error.message || 'Erro ao gerar ou enviar o PDF. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col p-4 bg-slate-50 text-slate-800 font-sans">
      <div className="mb-6 flex justify-between items-center px-2">
        <span className="text-xl font-bold text-blue-800">Passo {step} de 4</span>
        {step > 1 && step < 5 && (
          <button onClick={() => setStep(step - 1)} className="text-lg font-bold text-slate-600 p-2 underline">Voltar</button>
        )}
      </div>

      {step === 1 && (
        <div className="flex flex-col gap-6 animate-fade-in">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-4 leading-tight">Quem está enviando o atestado?</h1>
          <button className={btnPrimary} onClick={() => { setSelectedUserKey('maria'); setUser(USERS.maria); setStep(2); }}><IconUser />SOU A MARIA</button>
          <button className={`${btnBase} bg-indigo-700 text-white border-4 border-indigo-900`} onClick={() => { setSelectedUserKey('angela'); setUser(USERS.angela); setStep(2); }}><IconUser />SOU A ÂNGELA</button>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-6">
          <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">Dados do Atestado</h1>

          <div className="bg-white p-6 rounded-xl border-4 border-slate-200 shadow-sm overflow-hidden">
            <label className="block text-2xl font-bold text-slate-800 mb-4">Data de início do atestado:</label>
            <div className="relative w-full max-w-full box-border h-20 border-4 border-blue-400 rounded-lg bg-blue-50 overflow-hidden flex items-center justify-center px-2">
              <span className="text-2xl font-extrabold text-slate-900 leading-none text-center pointer-events-none whitespace-nowrap">
                {formatDataLongBR(date)}
              </span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                aria-label="Data de início do atestado"
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border-4 border-slate-200 shadow-sm flex flex-col gap-4">
            <label className="block text-2xl font-bold text-slate-800 mb-2">Tipo de Atestado:</label>
            {[
              { id: '01_03', label: 'De 01 a 03 dias' },
              { id: '04_15', label: 'De 04 a 15 dias' },
              { id: 'acima_15', label: 'Acima de 15 dias' },
              { id: 'acompanhamento', label: 'Licença p/ Acompanhamento' },
            ].map((opt) => (
              <label key={opt.id} className={`flex items-center gap-4 p-4 border-4 rounded-xl cursor-pointer transition-colors ${leaveType === opt.id ? 'border-blue-600 bg-blue-50' : 'border-slate-300'}`}>
                <input type="radio" name="dias" className="w-8 h-8 text-blue-600" checked={leaveType === opt.id} onChange={() => setLeaveType(opt.id)} />
                <span className="text-2xl font-bold">{opt.label}</span>
              </label>
            ))}
          </div>

          {leaveType !== '01_03' && (
            <div className="bg-white p-6 rounded-xl border-4 border-slate-200 shadow-sm flex flex-col gap-4 animate-fade-in">
              <label className="block text-2xl font-bold text-slate-800 mb-2">Turno (Período de agendamento):</label>
              <div className="flex gap-4">
                <label className={`flex-1 flex items-center justify-center gap-2 p-4 border-4 rounded-xl cursor-pointer ${shift === 'manha' ? 'border-blue-600 bg-blue-50' : 'border-slate-300'}`}>
                  <input type="radio" name="turno" className="w-6 h-6" checked={shift === 'manha'} onChange={() => setShift('manha')} />
                  <span className="text-xl font-bold">Manhã</span>
                </label>
                <label className={`flex-1 flex items-center justify-center gap-2 p-4 border-4 rounded-xl cursor-pointer ${shift === 'tarde' ? 'border-blue-600 bg-blue-50' : 'border-slate-300'}`}>
                  <input type="radio" name="turno" className="w-6 h-6" checked={shift === 'tarde'} onChange={() => setShift('tarde')} />
                  <span className="text-xl font-bold">Tarde</span>
                </label>
              </div>
            </div>
          )}

          {leaveType === 'acompanhamento' && (
            <div className="bg-indigo-50 p-6 rounded-xl border-4 border-indigo-200 shadow-sm flex flex-col gap-4 animate-fade-in">
              <label className="block text-xl font-bold text-indigo-900 mb-2">Detalhes do Acompanhamento:</label>
              <label className={`flex items-center gap-4 p-3 border-2 rounded-lg cursor-pointer bg-white ${acompType === '01_03' ? 'border-indigo-600' : 'border-slate-300'}`}>
                <input type="radio" name="acompType" className="w-6 h-6" checked={acompType === '01_03'} onChange={() => setAcompType('01_03')} />
                <span className="text-lg font-bold text-slate-700">De 01 a 03 dias</span>
              </label>
              <label className={`flex items-center gap-4 p-3 border-2 rounded-lg cursor-pointer bg-white ${acompType === 'acima_04' ? 'border-indigo-600' : 'border-slate-300'}`}>
                <input type="radio" name="acompType" className="w-6 h-6" checked={acompType === 'acima_04'} onChange={() => setAcompType('acima_04')} />
                <span className="text-lg font-bold text-slate-700">Acima de 04 dias</span>
              </label>
              <label className="block text-lg font-bold text-indigo-900 mt-2">Grau de Parentesco do Acompanhado:</label>
              <input type="text" placeholder="Ex: Filho, Mãe, Cônjuge..." value={kinship} onChange={(e) => setKinship(e.target.value)} className="w-full text-xl p-3 border-2 border-indigo-300 rounded-lg focus:outline-none focus:border-indigo-600 font-bold" />
            </div>
          )}

          <button className={btnSuccess} onClick={() => {
            if (leaveType !== '01_03' && !shift) { alert('Por favor, selecione o turno (Manhã ou Tarde).'); return; }
            if (leaveType === 'acompanhamento' && !kinship.trim()) { alert('Por favor, informe o grau de parentesco.'); return; }
            setStep(3);
          }}>AVANÇAR</button>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-6">
          <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">Documentos</h1>

          <div className="bg-white p-4 rounded-xl border-4 border-slate-200">
            <h2 className="text-2xl font-bold text-slate-800 mb-2 text-center">ATESTADO</h2>
            <p className="text-center text-red-600 font-bold mb-4 uppercase text-lg">(Obrigatório)</p>
            <label className={`cursor-pointer ${atestadoDoc ? btnSecondary + ' border-green-500' : btnPrimary}`}>
              {atestadoDoc ? <><IconCheck /><span className="text-green-700">Documento Adicionado!</span><span className="text-lg text-slate-500 underline mt-2">Trocar documento</span></> : <><IconCamera />ANEXAR ATESTADO</>}
              <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => handleFileRead(e, setAtestadoDoc)} />
            </label>
          </div>

          <div className="bg-white p-4 rounded-xl border-4 border-slate-200 relative">
            <h2 className="text-2xl font-bold text-slate-800 mb-2 text-center">IDENTIDADE</h2>
            <p className="text-center text-slate-600 font-bold mb-4 uppercase text-lg">{identidadeDoc ? '(Já está salva para esta pessoa)' : '(Salvar uma vez para esta pessoa)'}</p>
            <label className={`cursor-pointer ${identidadeDoc ? btnSecondary + ' border-green-500' : btnSecondary}`}>
              {identidadeDoc ? <><IconCheck /><span className="text-green-700 text-xl">Identidade já salva!</span><span className="text-lg text-slate-500 underline mt-2">Trocar identidade</span></> : <><IconCamera />SALVAR IDENTIDADE</>}
              <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => handleFileRead(e, setIdentidadeDoc, true)} />
            </label>
            {identidadeDoc && <button onClick={removeSavedId} className="w-full mt-4 p-4 flex items-center justify-center gap-2 text-red-700 font-bold text-xl border-2 border-red-200 rounded-lg bg-red-50"><IconTrash /> Apagar Identidade Salva</button>}
          </div>

          <button className={`mt-4 ${atestadoDoc ? btnSuccess : btnBase + ' bg-slate-300 text-slate-500 cursor-not-allowed border-slate-400'}`} onClick={() => { if (atestadoDoc) setStep(4); }} disabled={!atestadoDoc}>{atestadoDoc ? 'AVANÇAR' : 'Falta o Atestado'}</button>
        </div>
      )}

      {step === 4 && (
        <div className="flex flex-col gap-6 text-center">
          <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">Tudo Pronto!</h1>
          <p className="text-2xl text-slate-700">O formulário foi preenchido com seus dados e os documentos foram anexados.</p>
          <div className="bg-blue-50 border-4 border-blue-200 rounded-xl p-6 my-4 flex flex-col items-center">
            <IconFile />
            <p className="text-2xl font-bold text-blue-900 mt-4">1 PDF será gerado com: formulário, atestado e identidade.</p>
          </div>
          <button className={`${btnSuccess} mt-4 ${isGenerating ? 'animate-pulse' : ''}`} onClick={generateAndSharePDF} disabled={isGenerating}>{isGenerating ? 'GERANDO PDF...' : <><IconSend /> GERAR E ENVIAR POR EMAIL</>}</button>
        </div>
      )}

      {step === 5 && (
        <div className="flex flex-col gap-6 text-center items-center py-10">
          <IconCheck />
          <h1 className="text-4xl font-extrabold text-green-700 leading-tight">Sucesso!</h1>
          <p className="text-2xl text-slate-700 mt-4">O requerimento foi enviado automaticamente para a perícia médica.</p>
          <button className={`${btnPrimary} mt-10`} onClick={() => { setStep(1); setUser(null); setSelectedUserKey(null); setAtestadoDoc(null); }}>Fazer Outro Requerimento</button>
        </div>
      )}
    </div>
  );
}
