import React, { useState, useEffect } from 'react';

// Dados das Servidoras
const USERS = {
    maria: {
        nome: "Maria Auxiliadora dos Santos Paz", cpf: "892.023.256-34", cargo: "Auxiliar de Secretaria Escolar",
        orgao: "SEDUC", mat1: "28.757-1", unid1: "CEMEI Tropical", sit: "Efetivo(a)",
        tel: "(31) 98676-4711", email: "maspaz2005@hotmail.com"
    },
    angela: {
        nome: "Angela Maria dos Santos Silva", cpf: "691.746.016-87", cargo: "Auxiliar de Biblioteca Escolar",
        orgao: "SEDUC", mat1: "1620846", unid1: "E.M. DONA CORDELINA SILVEIRA MATTOS", sit: "Efetivo(a)",
        tel: "(31) 98834-7279", email: "angelam.silva@edu.contagem.mg.gov.br"
    }
};

// Ícones SVG Inline
const IconUser = () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const IconCamera = () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>;
const IconCheck = () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const IconFile = () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>;
const IconSend = () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;
const IconTrash = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;

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
    
    const [atestadoImg, setAtestadoImg] = useState(null);
    const [identidadeImg, setIdentidadeImg] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // Classes de botões padronizadas
    const btnBase = "w-full p-6 text-2xl font-extrabold rounded-2xl transition-all duration-200 text-center flex flex-col items-center justify-center gap-2 shadow-md active:scale-95";
    const btnPrimary = `${btnBase} bg-blue-700 text-white border-4 border-blue-900`;
    const btnSecondary = `${btnBase} bg-white text-slate-800 border-4 border-slate-300`;
    const btnSuccess = `${btnBase} bg-green-700 text-white border-4 border-green-900`;

    useEffect(() => {
        // Injetar scripts necessários para PDF
        const script1 = document.createElement('script');
        script1.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
        document.head.appendChild(script1);

        const script2 = document.createElement('script');
        script2.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
        document.head.appendChild(script2);
    }, []);

    useEffect(() => {
        if (!selectedUserKey) return;

        const savedId = localStorage.getItem(`saved_identidade_${selectedUserKey}`);
        setIdentidadeImg(savedId || null);
    }, [selectedUserKey]);

    const handleFileRead = (e, setter, saveLocal = false) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target.result;
            setter(base64);
            if (saveLocal && selectedUserKey) {
                localStorage.setItem(`saved_identidade_${selectedUserKey}`, base64);
            }
        };
        reader.readAsDataURL(file);
    };

    const removeSavedId = () => {
        if (selectedUserKey) {
            localStorage.removeItem(`saved_identidade_${selectedUserKey}`);
        }
        setIdentidadeImg(null);
    };

    const compressImageDataUrl = (dataUrl, maxWidth = 1200, quality = 0.65) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const scale = Math.min(1, maxWidth / img.width);
                const width = Math.round(img.width * scale);
                const height = Math.round(img.height * scale);

                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                ctx.fillStyle = "#FFFFFF";
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);

                resolve(canvas.toDataURL("image/jpeg", quality));
            };
            img.onerror = reject;
            img.src = dataUrl;
        });
    };

    const blobToBase64 = (blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(",")[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    const generateAndSharePDF = async () => {
        setIsGenerating(true);

        try {
            if (!window.jspdf || !window.html2canvas) {
                alert("Carregando recursos para gerar PDF. Tente novamente em 2 segundos.");
                return;
            }

            if (!user) {
                alert("Selecione a pessoa antes de enviar.");
                return;
            }

            if (!atestadoImg) {
                alert("Antes de enviar, anexe a foto do atestado.");
                return;
            }

            if (!identidadeImg) {
                alert("Antes de enviar, salve a identidade desta pessoa.");
                return;
            }

            const { jsPDF } = window.jspdf;
            const html2canvas = window.html2canvas;

            const doc = new jsPDF({
                orientation: "p",
                unit: "mm",
                format: "a4",
                compress: true,
            });

            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();

            const formElement = document.getElementById("pdf-template-container");
            const canvas = await html2canvas(formElement, {
                scale: 1.4,
                useCORS: true,
                backgroundColor: "#ffffff",
            });

            const formImg = canvas.toDataURL("image/jpeg", 0.65);
            const imgProps = doc.getImageProperties(formImg);
            const pdfHeight = (imgProps.height * pageWidth) / imgProps.width;
            doc.addImage(formImg, "JPEG", 0, 0, pageWidth, pdfHeight, undefined, "FAST");

            const addFullPageImage = async (imageDataUrl) => {
                const compressedImg = await compressImageDataUrl(imageDataUrl, 1200, 0.65);
                doc.addPage();

                const props = doc.getImageProperties(compressedImg);
                const margin = 10;
                const maxWidth = pageWidth - margin * 2;
                const maxHeight = pageHeight - margin * 2;

                let finalW = maxWidth;
                let finalH = (props.height * maxWidth) / props.width;

                if (finalH > maxHeight) {
                    finalH = maxHeight;
                    finalW = (props.width * maxHeight) / props.height;
                }

                const x = (pageWidth - finalW) / 2;
                const y = (pageHeight - finalH) / 2;
                doc.addImage(compressedImg, "JPEG", x, y, finalW, finalH, undefined, "FAST");
            };

            await addFullPageImage(atestadoImg);

            await addFullPageImage(identidadeImg);

            const pdfBlob = doc.output("blob");
            const fileName = `Requerimento_${user.nome.split(" ")[0]}_${date.replace(/-/g, "")}.pdf`;
            const pdfBase64 = await blobToBase64(pdfBlob);

            const response = await fetch("/api/send-email", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    fileName,
                    pdfBase64,
                    userName: user.nome,
                    userEmail: user.email,
                }),
            });

            const rawText = await response.text();
            let data = {};

            try {
                data = rawText ? JSON.parse(rawText) : {};
            } catch {
                data = { error: rawText };
            }

            if (!response.ok) {
                console.error("Erro da API:", data);
                alert(data.error || "Erro ao enviar o e-mail. Tente novamente.");
                return;
            }

            alert("E-mail enviado com sucesso!");
            setStep(5);

        } catch (error) {
            console.error(error);
            alert("Erro ao gerar ou enviar o PDF. Tente novamente.");
        } finally {
            setIsGenerating(false);
        }
    };

    const formatDataBR = (dataString) => {
        if (!dataString) return "";
        const [ano, mes, dia] = dataString.split('-');
        return `${dia}/${mes}/${ano}`;
    };

    return (
        <div className="max-w-md mx-auto min-h-screen flex flex-col p-4 bg-slate-50 text-slate-800 font-sans">
            
            <div className="mb-6 flex justify-between items-center px-2">
                <span className="text-xl font-bold text-blue-800">Passo {step} de 4</span>
                {step > 1 && step < 5 && (
                    <button onClick={() => setStep(step - 1)} className="text-lg font-bold text-slate-600 p-2 underline">
                        Voltar
                    </button>
                )}
            </div>

            {step === 1 && (
                <div className="flex flex-col gap-6 animate-fade-in">
                    <h1 className="text-3xl font-extrabold text-slate-900 mb-4 leading-tight">
                        Quem está enviando o atestado?
                    </h1>
                    <button 
                        className={btnPrimary}
                        onClick={() => { setSelectedUserKey('maria'); setUser(USERS.maria); setStep(2); }}
                    >
                        <IconUser />
                        SOU A MARIA
                    </button>
                    <button 
                        className={`${btnBase} bg-indigo-700 text-white border-4 border-indigo-900`}
                        onClick={() => { setSelectedUserKey('angela'); setUser(USERS.angela); setStep(2); }}
                    >
                        <IconUser />
                        SOU A ÂNGELA
                    </button>
                </div>
            )}

            {step === 2 && (
                <div className="flex flex-col gap-6">
                    <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">
                        Dados do Atestado
                    </h1>
                    
                    <div className="bg-white p-6 rounded-xl border-4 border-slate-200 shadow-sm">
                        <label className="block text-2xl font-bold text-slate-800 mb-4">
                            Data de início do atestado:
                        </label>
                        <input 
                            type="date" 
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full text-2xl p-4 border-4 border-blue-400 rounded-lg focus:outline-none focus:border-blue-700 font-bold text-center bg-blue-50"
                        />
                    </div>

                    <div className="bg-white p-6 rounded-xl border-4 border-slate-200 shadow-sm flex flex-col gap-4">
                        <label className="block text-2xl font-bold text-slate-800 mb-2">
                            Tipo de Atestado:
                        </label>
                        
                        {[
                            { id: '01_03', label: 'De 01 a 03 dias' },
                            { id: '04_15', label: 'De 04 a 15 dias' },
                            { id: 'acima_15', label: 'Acima de 15 dias' },
                            { id: 'acompanhamento', label: 'Licença p/ Acompanhamento' }
                        ].map(opt => (
                            <label key={opt.id} className={`flex items-center gap-4 p-4 border-4 rounded-xl cursor-pointer transition-colors ${leaveType === opt.id ? 'border-blue-600 bg-blue-50' : 'border-slate-300'}`}>
                                <input type="radio" name="dias" className="w-8 h-8 text-blue-600" checked={leaveType === opt.id} onChange={() => setLeaveType(opt.id)} />
                                <span className="text-2xl font-bold">{opt.label}</span>
                            </label>
                        ))}
                    </div>

                    {leaveType !== '01_03' && (
                        <div className="bg-white p-6 rounded-xl border-4 border-slate-200 shadow-sm flex flex-col gap-4 animate-fade-in">
                            <label className="block text-2xl font-bold text-slate-800 mb-2">
                                Turno (Período de agendamento):
                            </label>
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
                            <label className="block text-xl font-bold text-indigo-900 mb-2">
                                Detalhes do Acompanhamento:
                            </label>

                            <label className={`flex items-center gap-4 p-3 border-2 rounded-lg cursor-pointer bg-white ${acompType === '01_03' ? 'border-indigo-600' : 'border-slate-300'}`}>
                                <input type="radio" name="acompType" className="w-6 h-6" checked={acompType === '01_03'} onChange={() => setAcompType('01_03')} />
                                <span className="text-lg font-bold text-slate-700">De 01 a 03 dias</span>
                            </label>

                            <label className={`flex items-center gap-4 p-3 border-2 rounded-lg cursor-pointer bg-white ${acompType === 'acima_04' ? 'border-indigo-600' : 'border-slate-300'}`}>
                                <input type="radio" name="acompType" className="w-6 h-6" checked={acompType === 'acima_04'} onChange={() => setAcompType('acima_04')} />
                                <span className="text-lg font-bold text-slate-700">Acima de 04 dias</span>
                            </label>

                            <label className="block text-lg font-bold text-indigo-900 mt-2">
                                Grau de Parentesco do Acompanhado:
                            </label>
                            <input
                                type="text"
                                placeholder="Ex: Filho, Mãe, Cônjuge..."
                                value={kinship}
                                onChange={(e) => setKinship(e.target.value)}
                                className="w-full text-xl p-3 border-2 border-indigo-300 rounded-lg focus:outline-none focus:border-indigo-600 font-bold"
                            />
                        </div>
                    )}

                    <button 
                        className={btnSuccess} 
                        onClick={() => {
                            if (leaveType !== '01_03' && !shift) {
                                alert('Por favor, selecione o turno (Manhã ou Tarde).');
                                return;
                            }
                            if (leaveType === 'acompanhamento' && !kinship.trim()) {
                                alert('Por favor, informe o grau de parentesco.');
                                return;
                            }
                            setStep(3);
                        }}
                    >
                        AVANÇAR
                    </button>
                </div>
            )}

            {step === 3 && (
                <div className="flex flex-col gap-6">
                    <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">
                        Fotos dos Documentos
                    </h1>

                    <div className="bg-white p-4 rounded-xl border-4 border-slate-200">
                        <h2 className="text-2xl font-bold text-slate-800 mb-2 text-center">FOTO DO ATESTADO</h2>
                        <p className="text-center text-red-600 font-bold mb-4 uppercase text-lg">(Obrigatório)</p>
                        
                        <label className={`cursor-pointer ${atestadoImg ? btnSecondary + ' border-green-500' : btnPrimary}`}>
                            {atestadoImg ? <><IconCheck /><span className="text-green-700">Foto Adicionada!</span><span className="text-lg text-slate-500 underline mt-2">Trocar foto</span></> : <><IconCamera />TIRAR FOTO DO ATESTADO</>}
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileRead(e, setAtestadoImg)} />
                        </label>
                    </div>

                    <div className="bg-white p-4 rounded-xl border-4 border-slate-200 relative">
                        <h2 className="text-2xl font-bold text-slate-800 mb-2 text-center">FOTO DA IDENTIDADE</h2>
                        <p className="text-center text-slate-600 font-bold mb-4 uppercase text-lg">
                            {identidadeImg ? '(Já está salva para esta pessoa)' : '(Salvar uma vez para esta pessoa)'}
                        </p>
                        
                        <label className={`cursor-pointer ${identidadeImg ? btnSecondary + ' border-green-500' : btnSecondary}`}>
                            {identidadeImg ? <><IconCheck /><span className="text-green-700 text-xl">Identidade já salva!</span><span className="text-lg text-slate-500 underline mt-2">Trocar identidade</span></> : <><IconCamera />SALVAR IDENTIDADE</>}
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileRead(e, setIdentidadeImg, true)} />
                        </label>
                        
                        {identidadeImg && (
                            <button onClick={removeSavedId} className="w-full mt-4 p-4 flex items-center justify-center gap-2 text-red-700 font-bold text-xl border-2 border-red-200 rounded-lg bg-red-50">
                                <IconTrash /> Apagar Identidade Salva
                            </button>
                        )}
                    </div>

                    <button 
                        className={`mt-4 ${atestadoImg && identidadeImg ? btnSuccess : btnBase + ' bg-slate-300 text-slate-500 cursor-not-allowed border-slate-400'}`}
                        onClick={() => { if(atestadoImg && identidadeImg) setStep(4); }}
                        disabled={!atestadoImg || !identidadeImg}
                    >
                        {!atestadoImg ? 'Falta o Atestado' : !identidadeImg ? 'Falta a Identidade' : 'AVANÇAR'}
                    </button>
                </div>
            )}

            {step === 4 && (
                <div className="flex flex-col gap-6 text-center">
                    <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">
                        Tudo Pronto!
                    </h1>
                    <p className="text-2xl text-slate-700">
                        O formulário foi preenchido com seus dados e as fotos foram anexadas.
                    </p>

                    <div className="bg-blue-50 border-4 border-blue-200 rounded-xl p-6 my-4 flex flex-col items-center">
                        <IconFile />
                        <p className="text-2xl font-bold text-blue-900 mt-4">
                            1 PDF será gerado com: formulário, atestado e identidade.
                        </p>
                    </div>

                    <button 
                        className={`${btnSuccess} mt-4 ${isGenerating ? 'animate-pulse' : ''}`}
                        onClick={generateAndSharePDF}
                        disabled={isGenerating}
                    >
                        {isGenerating ? 'GERANDO PDF...' : <><IconSend /> GERAR E ENVIAR POR EMAIL</>}
                    </button>
                </div>
            )}

            {step === 5 && (
                <div className="flex flex-col gap-6 text-center items-center py-10">
                    <IconCheck />
                    <h1 className="text-4xl font-extrabold text-green-700 leading-tight">
                        Sucesso!
                    </h1>
                    <p className="text-2xl text-slate-700 mt-4">
                        O requerimento foi enviado automaticamente para a perícia médica.
                    </p>
                    <button className={`${btnPrimary} mt-10`} onClick={() => { setStep(1); setUser(null); setSelectedUserKey(null); setAtestadoImg(null); setIdentidadeImg(null); }}>
                        Fazer Outro Requerimento
                    </button>
                </div>
            )}

            {/* Oculto: Base para renderizar o PDF - Formulário oficial */}
            {user && (
                <div
                    id="pdf-template-container"
                    style={{ position: 'absolute', left: '-9999px', top: 0, background: 'white', width: '210mm', minHeight: '297mm', padding: '8mm 9mm', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif', color: 'black', fontSize: '9px', lineHeight: '1.15' }}
                >
                    <style>{`
                        .oficial-page * { box-sizing: border-box; }
                        .oficial-header { text-align:center; font-size:9px; font-weight:bold; line-height:1.25; margin-bottom:5px; }
                        .oficial-title { font-size:9px; font-weight:bold; text-align:center; margin-top:2px; }
                        .oficial-grid { display:grid; grid-template-columns: 1fr 1fr; border-left:1px solid #000; border-top:1px solid #000; }
                        .oficial-cell { border-right:1px solid #000; border-bottom:1px solid #000; min-height:15px; padding:2px 4px; display:flex; align-items:center; gap:4px; }
                        .oficial-span { grid-column: span 2; }
                        .oficial-label { font-weight:bold; white-space:nowrap; }
                        .oficial-check { display:inline-flex; width:10px; height:10px; border:1px solid #000; align-items:center; justify-content:center; font-size:8px; font-weight:bold; margin-right:3px; line-height:1; vertical-align:middle; }
                        .oficial-red { color:#b00000; font-weight:bold; }
                        .oficial-small { font-size:8px; }
                        .oficial-line { border-bottom:1px solid #000; display:inline-block; min-width:70px; height:10px; vertical-align:bottom; }
                        .oficial-date-line { border-bottom:1px solid #000; display:inline-block; min-width:58px; text-align:center; font-weight:bold; }
                        .oficial-two-col { display:grid; grid-template-columns: 1fr 49mm; gap:4px; align-items:start; }
                        .oficial-section { border:1px solid #000; border-top:none; padding:4px 5px; }
                        .oficial-period { border:1px solid #000; padding:3px; text-align:center; font-weight:bold; font-size:8.5px; }
                        .oficial-row { display:flex; align-items:flex-start; min-height:15px; }
                        .oficial-footer-note { margin-top:8px; font-size:8.5px; line-height:1.2; }
                        .oficial-requisitos { margin-top:6px; font-size:8.5px; line-height:1.2; }
                    `}</style>

                    <div className="oficial-page">
                        <div className="oficial-header">
                            Prefeitura Municipal de Contagem<br />
                            Secretaria Municipal de Administração<br />
                            Superintendência de Medicina e Segurança do Trabalho
                        </div>
                        <div className="oficial-title">FORMULÁRIO/REQUERIMENTO PARA AGENDAMENTO/REALIZAÇÃO DE PERÍCIA MÉDICA E PSICOSSOCIAL</div>

                        <div className="oficial-grid" style={{ marginTop: '5px' }}>
                            <div className="oficial-cell"><span className="oficial-label">Nome completo:</span><span>{user.nome}</span></div>
                            <div className="oficial-cell"><span className="oficial-label">CPF:</span><span>{user.cpf}</span></div>
                            <div className="oficial-cell"><span className="oficial-label">Cargo/Função:</span><span>{user.cargo}</span></div>
                            <div className="oficial-cell"><span className="oficial-label">Órgão (lotação):</span><span>{user.orgao}</span></div>
                            <div className="oficial-cell"><span className="oficial-label">Mat. 1º cargo:</span><span>{user.mat1}</span></div>
                            <div className="oficial-cell"><span className="oficial-label">Mat. 2º cargo:</span><span></span></div>
                            <div className="oficial-cell"><span className="oficial-label">Unid. (lotação) 1º cargo:</span><span>{user.unid1}</span></div>
                            <div className="oficial-cell"><span className="oficial-label">Unid. (lotação) 2º cargo:</span><span></span></div>
                            <div className="oficial-cell oficial-span">
                                <span className="oficial-label">Sit. funcional:</span>
                                <span><span className="oficial-check">X</span>Efetivo(a)</span>
                                <span><span className="oficial-check"></span>Comissionado(a)</span>
                                <span><span className="oficial-check"></span>Contratado(a)</span>
                                <span>Outros: _____________________________</span>
                            </div>
                            <div className="oficial-cell"><span className="oficial-label">Telefone:</span><span>{user.tel}</span></div>
                            <div className="oficial-cell"><span className="oficial-label">E-mail:</span><span>{user.email}</span></div>
                        </div>

                        <div className="oficial-section">
                            <div className="oficial-two-col">
                                <div>
                                    <div className="oficial-red">Assinale abaixo o Tipo de Perícia Médica:</div>
                                    <div className="oficial-small"><b>*ATENÇÃO!</b> Para cada Requerimento/solicitação assinale apenas<br />um único tipo de Perícia Médica a ser realizada.</div>
                                </div>
                                <div className="oficial-period">
                                    Assinale abaixo o melhor período p/ agendamento:<br />
                                    <span style={{ marginRight: '10px' }}><span className="oficial-check">{shift === 'manha' ? 'X' : ''}</span> MANHÃ</span>
                                    <span><span className="oficial-check">{shift === 'tarde' ? 'X' : ''}</span> TARDE</span>
                                </div>
                            </div>

                            <div style={{ marginTop: '5px' }}>
                                <div className="oficial-row"><span className="oficial-check">{leaveType === '01_03' ? 'X' : ''}</span><span>Perícia Médica – Atestado de 01 a 03 dias – Data de início do atestado: <span className="oficial-date-line">{leaveType === '01_03' ? formatDataBR(date) : '___/___/_____'}</span></span></div>
                                <div className="oficial-small" style={{ marginLeft: '14px' }}>* (anexar documentação - Atestado - obrigatório)</div>
                                <div className="oficial-row"><span className="oficial-check">{leaveType === '04_15' ? 'X' : ''}</span><span>Perícia Médica – Atestado de 04 a 15 dias – Data de início do atestado: <span className="oficial-date-line">{leaveType === '04_15' ? formatDataBR(date) : '___/___/_____'}</span></span></div>
                                <div className="oficial-row"><span className="oficial-check">{leaveType === 'acima_15' ? 'X' : ''}</span><span>Perícia Médica – Atestado acima 15 dias – Data de início do atestado: <span className="oficial-date-line">{leaveType === 'acima_15' ? formatDataBR(date) : '___/___/_____'}</span></span></div>
                                <div className="oficial-row"><span className="oficial-check"></span><span>Perícia Médica – Acidente de trabalho – Data de início do atestado: <span className="oficial-date-line">___/___/_____</span></span></div>
                                <div className="oficial-small" style={{ marginLeft: '14px' }}>*(anexar documentação CAT - obrigatório)</div>
                                <div className="oficial-row"><span className="oficial-check">{leaveType === 'acompanhamento' ? 'X' : ''}</span><span>Licença p/acompanhamento - serviço p/servidores efetivos - Data de início do atestado: <span className="oficial-date-line">{leaveType === 'acompanhamento' ? formatDataBR(date) : '___/___/_____'}</span></span></div>
                                <div style={{ marginLeft: '14px' }}>
                                    * Assinale o tipo a seguir: <span className="oficial-check">{leaveType === 'acompanhamento' && acompType === '01_03' ? 'X' : ''}</span> Perícia médica de 01 a 03 dias - <span className="oficial-small">(anexar atestado e documentação – obrigatório)</span><br />
                                    <span style={{ marginLeft: '91px' }}><span className="oficial-check">{leaveType === 'acompanhamento' && acompType === 'acima_04' ? 'X' : ''}</span> Perícia médica acima de 04 dias</span><br />
                                    * Grau de parentesco do(a) acompanhado(a): <span className="oficial-line" style={{ minWidth: '65px' }}>{leaveType === 'acompanhamento' ? kinship : ''}</span>
                                    <span style={{ marginLeft: '12px' }}><span className="oficial-check"></span> Diarista</span><br />
                                    <span style={{ marginLeft: '235px' }}><span className="oficial-check"></span> Plantonista: carga horária: _______</span>
                                </div>
                                <div className="oficial-row"><span className="oficial-check"></span><span>Restrição Médica.</span></div>
                                <div style={{ marginLeft: '14px' }}><b>ASSINALE O TIPO A SEGUIR:</b> <span className="oficial-check"></span> 1ª Restrição <span className="oficial-check"></span> Reavaliação da Restrição Médica.</div>
                                <div className="oficial-row"><span className="oficial-check"></span><span>Licença Maternidade.</span></div>
                                <div className="oficial-row"><span className="oficial-check"></span><span>Reagendamento – Perícias Médicas e Social.</span></div>
                            </div>

                            <div style={{ height: '14px' }}></div>
                            <div>
                                <b>ASSINALE O TIPO A SEGUIR:</b>
                                <span style={{ marginLeft: '8px' }}><span className="oficial-check"></span> Licença para acompanhamento</span>
                                <span style={{ marginLeft: '8px' }}><span className="oficial-check"></span> Licença maternidade</span><br />
                                <span style={{ marginLeft: '99px' }}><span className="oficial-check"></span> Perícia médica de 01 a 03 dias</span>
                                <span style={{ marginLeft: '8px' }}><span className="oficial-check"></span> Perícia médica de 04 a 15 dias</span>
                                <span style={{ marginLeft: '8px' }}><span className="oficial-check"></span> Perícia médica acima de 15 dias</span><br />
                                <span style={{ marginLeft: '99px' }}><span className="oficial-check"></span> Perícia médica – Acidente de Trabalho</span>
                                <span style={{ marginLeft: '8px' }}><span className="oficial-check"></span> Restrição médica</span>
                            </div>
                            <div className="oficial-footer-note">Atenção: é obrigatório anexar juntamente com o requerimento a documentação comprobatória conforme art. 4º, § 7,<br />Decreto Municipal 679, de 15/09/2022 e alterações do Decreto Municipal nº 808, de 18/01/2023.</div>
                            <div style={{ marginTop: '8px' }}><span className="oficial-check"></span> Recurso Contra Indeferimento da solicitação de Perícia Médica. Nº completo PA <span className="oficial-line"></span><br /><span className="oficial-small">*(anexar junto ao formulário a devida justificativa)</span></div>
                        </div>

                        <div className="oficial-requisitos"><b>REQUISITOS:</b><br />1. Formulário/requerimento específico preenchido e documentos exigidos conforme Decreto 679 de 15 de<br />setembro de 2022 e alterações do Decreto Municipal nº 808, de 18/01/2023.</div>
                        <div style={{ marginTop: '14px', fontSize: '9px', textAlign: 'center' }}><b>CONTAGEM-MG, <span className="oficial-date-line" style={{ minWidth: '22px' }}></span> / <span className="oficial-date-line" style={{ minWidth: '22px' }}></span> / <span className="oficial-date-line" style={{ minWidth: '36px' }}></span> (Data)</b></div>
                    </div>
                </div>
            )}
        </div>
    );
}
