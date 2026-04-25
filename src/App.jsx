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
        // Carregar identidade salva do localStorage
        const savedId = localStorage.getItem('saved_identidade');
        if (savedId) setIdentidadeImg(savedId);

        // Injetar scripts necessários para PDF
        const script1 = document.createElement('script');
        script1.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
        document.head.appendChild(script1);

        const script2 = document.createElement('script');
        script2.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
        document.head.appendChild(script2);
    }, []);

    const handleFileRead = (e, setter, saveLocal = false) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target.result;
            setter(base64);
            if (saveLocal) {
                localStorage.setItem('saved_identidade', base64);
            }
        };
        reader.readAsDataURL(file);
    };

    const removeSavedId = () => {
        localStorage.removeItem('saved_identidade');
        setIdentidadeImg(null);
    };

    const generateAndSharePDF = async () => {
        setIsGenerating(true);
        try {
            if (!window.jspdf || !window.html2canvas) {
                alert("Carregando recursos para gerar PDF. Tente novamente em 2 segundos.");
                setIsGenerating(false);
                return;
            }

            const { jsPDF } = window.jspdf;
            const html2canvas = window.html2canvas;

            const doc = new jsPDF('p', 'mm', 'a4');
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();

            const formElement = document.getElementById('pdf-template-container');
            const canvas = await html2canvas(formElement, { scale: 2 });
            const formImg = canvas.toDataURL('image/jpeg', 0.8);
            
            const imgProps = doc.getImageProperties(formImg);
            const pdfHeight = (imgProps.height * pageWidth) / imgProps.width;
            doc.addImage(formImg, 'JPEG', 0, 0, pageWidth, pdfHeight);

            if (atestadoImg) {
                doc.addPage();
                const atesProps = doc.getImageProperties(atestadoImg);
                const margin = 10;
                const maxWidth = pageWidth - (margin * 2);
                const maxHeight = pageHeight - (margin * 2);
                
                let finalW = maxWidth;
                let finalH = (atesProps.height * maxWidth) / atesProps.width;
                
                if (finalH > maxHeight) {
                    finalH = maxHeight;
                    finalW = (atesProps.width * maxHeight) / atesProps.height;
                }
                
                const x = (pageWidth - finalW) / 2;
                const y = (pageHeight - finalH) / 2;
                doc.addImage(atestadoImg, 'JPEG', x, y, finalW, finalH);
            }

            if (identidadeImg) {
                doc.addPage();
                const idProps = doc.getImageProperties(identidadeImg);
                const margin = 10;
                const maxWidth = pageWidth - (margin * 2);
                const maxHeight = pageHeight - (margin * 2);
                let finalW = maxWidth;
                let finalH = (idProps.height * maxWidth) / idProps.width;
                
                if (finalH > maxHeight) {
                    finalH = maxHeight;
                    finalW = (idProps.width * maxHeight) / idProps.height;
                }
                
                const x = (pageWidth - finalW) / 2;
                const y = (pageHeight - finalH) / 2;
                doc.addImage(identidadeImg, 'JPEG', x, y, finalW, finalH);
            }

            const pdfBlob = doc.output('blob');
            const fileName = `Requerimento_${user.nome.split(' ')[0]}_${date.replace(/-/g, '')}.pdf`;
            const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

            const reader = new FileReader();

reader.onloadend = async () => {
    const pdfBase64 = reader.result.split(",")[1];

    const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            fileName,
            pdfBase64,
            userName: user.nome,
        }),
    });

    if (!response.ok) {
        alert("Erro ao enviar o e-mail. Tente novamente.");
        return;
    }

    setStep(5);
};

reader.readAsDataURL(pdfBlob); {
                const url = URL.createObjectURL(pdfBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                a.click();
                setStep(5);
            }
        } catch (error) {
            console.error(error);
            alert("Erro ao gerar o PDF. Tente novamente.");
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
                        onClick={() => { setUser(USERS.maria); setStep(2); }}
                    >
                        <IconUser />
                        SOU A MARIA
                    </button>
                    <button 
                        className={`${btnBase} bg-indigo-700 text-white border-4 border-indigo-900`}
                        onClick={() => { setUser(USERS.angela); setStep(2); }}
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
                        <p className="text-center text-slate-600 font-bold mb-4 uppercase text-lg">(Opcional)</p>
                        
                        <label className={`cursor-pointer ${identidadeImg ? btnSecondary + ' border-green-500' : btnSecondary}`}>
                            {identidadeImg ? <><IconCheck /><span className="text-green-700 text-xl">Identidade Salva!</span></> : <><IconCamera />TIRAR FOTO DA IDENTIDADE</>}
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileRead(e, setIdentidadeImg, true)} />
                        </label>
                        
                        {identidadeImg && (
                            <button onClick={removeSavedId} className="w-full mt-4 p-4 flex items-center justify-center gap-2 text-red-700 font-bold text-xl border-2 border-red-200 rounded-lg bg-red-50">
                                <IconTrash /> Apagar Identidade Salva
                            </button>
                        )}
                    </div>

                    <button 
                        className={`mt-4 ${atestadoImg ? btnSuccess : btnBase + ' bg-slate-300 text-slate-500 cursor-not-allowed border-slate-400'}`}
                        onClick={() => { if(atestadoImg) setStep(4); }}
                        disabled={!atestadoImg}
                    >
                        {atestadoImg ? 'AVANÇAR' : 'Falta o Atestado'}
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
                            1 Arquivo PDF será gerado contendo todas as informações.
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
                        O arquivo foi processado. Se a tela do seu e-mail ou WhatsApp abriu, basta enviar!
                    </p>
                    <button className={`${btnPrimary} mt-10`} onClick={() => { setStep(1); setAtestadoImg(null); }}>
                        Fazer Outro Requerimento
                    </button>
                </div>
            )}

            {/* Oculto: Base para renderizar o PDF */}
            {user && (
                <div 
                    id="pdf-template-container" 
                    style={{ position: 'absolute', left: '-9999px', top: 0, background: 'white', width: '210mm', padding: '10mm', fontFamily: 'Arial, sans-serif', color: 'black' }}
                >
                    <div style={{ textAlign: 'center', fontSize: '12px', fontWeight: 'bold', marginBottom: '20px' }}>
                        PREFEITURA MUNICIPAL DE CONTAGEM<br/>
                        Secretaria Municipal de Administração<br/>
                        Superintendência de Medicina e Segurança do Trabalho<br/>
                        FORMULÁRIO/REQUERIMENTO PARA AGENDAMENTO/REALIZAÇÃO DE PERÍCIA MÉDICA E PSICOSSOCIAL
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '2px solid black', borderLeft: '2px solid black', marginTop: '10px' }}>
                        <div style={{ borderBottom: '2px solid black', borderRight: '2px solid black', padding: '4px 8px', fontSize: '12px', gridColumn: 'span 2' }}>
                            <b>Nome completo:</b> {user.nome} &nbsp;&nbsp;&nbsp;&nbsp; <b>CPF:</b> {user.cpf}
                        </div>
                        <div style={{ borderBottom: '2px solid black', borderRight: '2px solid black', padding: '4px 8px', fontSize: '12px' }}><b>Cargo/Função:</b> {user.cargo}</div>
                        <div style={{ borderBottom: '2px solid black', borderRight: '2px solid black', padding: '4px 8px', fontSize: '12px' }}><b>Órgão (lotação):</b> {user.orgao}</div>
                        <div style={{ borderBottom: '2px solid black', borderRight: '2px solid black', padding: '4px 8px', fontSize: '12px' }}><b>Mat. 1º cargo:</b> {user.mat1}</div>
                        <div style={{ borderBottom: '2px solid black', borderRight: '2px solid black', padding: '4px 8px', fontSize: '12px' }}><b>Mat. 2º cargo:</b> </div>
                        <div style={{ borderBottom: '2px solid black', borderRight: '2px solid black', padding: '4px 8px', fontSize: '12px' }}><b>Unid. (lotação) 1º cargo:</b> {user.unid1}</div>
                        <div style={{ borderBottom: '2px solid black', borderRight: '2px solid black', padding: '4px 8px', fontSize: '12px' }}><b>Unid. (lotação) 2º cargo:</b> </div>
                        <div style={{ borderBottom: '2px solid black', borderRight: '2px solid black', padding: '4px 8px', fontSize: '12px', gridColumn: 'span 2' }}>
                            <b>Sit. funcional:</b> [X] Efetivo(a) &nbsp; [ ] Comissionado(a) &nbsp; [ ] Contratado(a)
                        </div>
                        <div style={{ borderBottom: '2px solid black', borderRight: '2px solid black', padding: '4px 8px', fontSize: '12px' }}><b>Telefone:</b> {user.tel}</div>
                        <div style={{ borderBottom: '2px solid black', borderRight: '2px solid black', padding: '4px 8px', fontSize: '12px' }}><b>E-mail:</b> {user.email}</div>
                    </div>

                    <div style={{ marginTop: '20px', border: '2px solid black', padding: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase', color: 'red' }}>
                                Assinale abaixo o Tipo de Perícia Médica:<br/>
                                <span style={{fontSize: '10px', color: 'black'}}>*ATENÇÃO! Para cada Requerimento assinale apenas um único tipo.</span>
                            </div>
                            <div style={{ fontWeight: 'bold', fontSize: '12px', textAlign: 'center', border: '1px solid black', padding: '4px', backgroundColor: '#e2e8f0' }}>
                                Assinale abaixo o melhor período p/ agendamento:
                            </div>
                        </div>
                        
                        <div style={{ fontSize: '12px', lineHeight: '1.6', marginTop: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '4px' }}>
                                <div>
                                    <b>* Perícia Médica – Atestado de 01 a 03 dias</b><br/>
                                    [{leaveType === '01_03' ? 'X' : ' '}] Agendamento &nbsp;&nbsp;&nbsp;&nbsp; Data de início do atestado: {leaveType === '01_03' ? formatDataBR(date) : '__/__/____'}
                                </div>
                                <div style={{ fontStyle: 'italic', color: '#555' }}>(anexar atestado - obrigatório)</div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '4px' }}>
                                <div>
                                    <b>* Perícia Médica – Atestado de 04 a 15 dias</b><br/>
                                    [{leaveType === '04_15' ? 'X' : ' '}] Agendamento &nbsp;&nbsp;&nbsp;&nbsp; Data de início do atestado: {leaveType === '04_15' ? formatDataBR(date) : '__/__/____'}
                                </div>
                                <div>
                                    [{leaveType === '04_15' && shift === 'manha' ? 'X' : ' '}] Manhã &nbsp;&nbsp;
                                    [{leaveType === '04_15' && shift === 'tarde' ? 'X' : ' '}] Tarde
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '4px' }}>
                                <div>
                                    <b>* Perícia Médica – Atestado acima 15 dias</b><br/>
                                    [{leaveType === 'acima_15' ? 'X' : ' '}] Agendamento &nbsp;&nbsp;&nbsp;&nbsp; Data de início do atestado: {leaveType === 'acima_15' ? formatDataBR(date) : '__/__/____'}
                                </div>
                                <div>
                                    [{leaveType === 'acima_15' && shift === 'manha' ? 'X' : ' '}] Manhã &nbsp;&nbsp;
                                    [{leaveType === 'acima_15' && shift === 'tarde' ? 'X' : ' '}] Tarde
                                </div>
                            </div>

                            <div style={{ borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '4px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <div>
                                        <b>[{leaveType === 'acompanhamento' ? 'X' : ' '}] Licença p/ Acompanhamento - serviço p/ servidores efetivos.</b>
                                    </div>
                                    <div>
                                        [{leaveType === 'acompanhamento' && shift === 'manha' ? 'X' : ' '}] Manhã &nbsp;&nbsp;
                                        [{leaveType === 'acompanhamento' && shift === 'tarde' ? 'X' : ' '}] Tarde
                                    </div>
                                </div>
                                <div style={{ paddingLeft: '10px', marginTop: '4px' }}>
                                    * Assinale o tipo a seguir: &nbsp;
                                    [{leaveType === 'acompanhamento' && acompType === '01_03' ? 'X' : ' '}] Perícia médica de 01 a 03 dias<br/>
                                    <span style={{ paddingLeft: '120px' }}>[{leaveType === 'acompanhamento' && acompType === 'acima_04' ? 'X' : ' '}] Perícia médica acima de 04 dias</span><br/>
                                    * Data de início do atestado: {leaveType === 'acompanhamento' ? formatDataBR(date) : '__/__/____'}<br/>
                                    * Grau de parentesco do(a) acompanhado(a): {leaveType === 'acompanhamento' ? kinship : '____________________________________'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '40px', fontSize: '14px', textAlign: 'center' }}>
                        <b>REQUISITOS:</b><br/>
                        1. Formulário/requerimento específico preenchido e documentos exigidos conforme Decreto.<br/><br/><br/>
                        <b>CONTAGEM-MG, ____ {formatDataBR(date)} ____ (Data)</b>
                    </div>
                </div>
            )}
        </div>
    );
}