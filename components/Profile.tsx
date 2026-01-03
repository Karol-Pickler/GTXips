
import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Camera, Upload, Shield, Calendar, Mail, Briefcase, X, Check, Loader2 } from 'lucide-react';

const Profile: React.FC = () => {
  const { currentUser, notify, updateProfile } = useApp();
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  if (!currentUser) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        notify('A imagem deve ter no máximo 2MB.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updatePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      notify('Não foi possível acessar a câmera.', 'error');
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Use realistic dimensions for profile photo
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Center crop to square
        const size = Math.min(video.videoWidth, video.videoHeight);
        const x = (video.videoWidth - size) / 2;
        const y = (video.videoHeight - size) / 2;
        ctx.drawImage(video, x, y, size, size, 0, 0, 400, 400);
      }

      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      updatePhoto(dataUrl);
      stopCamera();
    }
  };

  const updatePhoto = async (dataUrl: string) => {
    setIsUpdating(true);
    try {
      const success = await updateProfile({ fotoUrl: dataUrl });
      if (success) {
        notify('Foto de perfil atualizada!', 'success');
      }
    } catch (err) {
      console.error(err);
      notify('Erro ao atualizar foto.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      <header>
        <h1 className="text-3xl font-black tracking-tighter text-ui-text uppercase">Meu Perfil</h1>
        <p className="text-ui-muted">Visualize seus dados e gerencie sua identidade visual.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Foto Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-8 rounded-[40px] border border-brand-primary/20 flex flex-col items-center text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-brand-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

            <div className="relative mb-6">
              <div
                onClick={!isUpdating ? startCamera : undefined}
                className={`w-40 h-40 rounded-full border-4 border-brand-primary/30 p-1 shadow-[0_0_20px_rgba(119,194,85,0.2)] overflow-hidden cursor-pointer hover:border-brand-primary transition-all ${isUpdating ? 'opacity-50' : ''}`}
              >
                <img src={currentUser.fotoUrl} alt={currentUser.nome} className="w-full h-full rounded-full object-cover" />
              </div>
              <button
                onClick={startCamera}
                disabled={isUpdating}
                className="absolute -bottom-2 -right-2 bg-brand-primary text-black p-2 rounded-full shadow-lg border-2 border-ui-bg hover:scale-110 active:scale-95 transition-all disabled:opacity-50"
              >
                <Camera size={20} />
              </button>
            </div>

            <h2 className="text-xl font-bold mb-1">{currentUser.nome}</h2>
            <p className="text-[10px] uppercase font-black tracking-widest text-brand-primary mb-6">{currentUser.cargo}</p>

            <div className="w-full space-y-3">
              <button
                onClick={startCamera}
                disabled={isUpdating}
                className="w-full bg-white/5 border border-white/10 hover:border-brand-primary/40 p-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold transition-all disabled:opacity-50"
              >
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera size={16} className="text-brand-primary" />}
                USAR CÂMERA
              </button>

              <label className={`w-full bg-ui-text text-ui-bg p-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-black cursor-pointer hover:bg-brand-primary hover:text-black transition-all ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload size={16} />}
                ENVIAR ARQUIVO
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isUpdating} />
              </label>
            </div>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] uppercase font-bold text-ui-muted">Saldo de GTXips</p>
              <Shield size={16} className="text-brand-primary" />
            </div>
            <p className="text-4xl font-black text-brand-primary neon-text">{currentUser.saldoAtual} GTX</p>
          </div>
        </div>

        {/* Dados Card */}
        <div className="lg:col-span-2 glass-card p-8 rounded-[40px] border border-white/5 space-y-8">
          <h3 className="text-lg font-bold flex items-center gap-3">
            <Shield size={20} className="text-brand-primary" />
            Dados do Colaborador
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-ui-muted ml-1 flex items-center gap-2">
                <Mail size={12} /> E-mail Corporativo
              </label>
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-sm font-medium opacity-70">
                {currentUser.email}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-ui-muted ml-1 flex items-center gap-2">
                <Briefcase size={12} /> Cargo Atual
              </label>
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-sm font-medium opacity-70">
                {currentUser.cargo}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-ui-muted ml-1 flex items-center gap-2">
                <Calendar size={12} /> Data de Nascimento
              </label>
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-sm font-medium opacity-70">
                {currentUser.dataNascimento}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-ui-muted ml-1 flex items-center gap-2">
                <Calendar size={12} /> Admissão na GTX
              </label>
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-sm font-medium opacity-70">
                {currentUser.dataContratacao}
              </div>
            </div>
          </div>

          <div className="p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/10">
            <p className="text-[10px] text-brand-primary font-bold uppercase mb-2 flex items-center gap-2">
              <Shield size={12} /> Política de Segurança
            </p>
            <p className="text-xs text-ui-muted leading-relaxed">
              Os dados acima são importados diretamente do RH e não podem ser alterados pelo usuário.
              Caso identifique algum erro, entre em contato com o administrador do sistema.
            </p>
          </div>
        </div>
      </div>

      {/* Camera Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="w-full max-w-lg space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold flex items-center gap-2"><Camera className="text-brand-primary" /> Sorria!</h3>
              <button onClick={stopCamera} className="p-2 bg-white/10 rounded-full text-ui-muted hover:text-white"><X /></button>
            </div>

            <div className="relative aspect-square rounded-[40px] overflow-hidden border-2 border-brand-primary/30 shadow-[0_0_50px_rgba(119,194,85,0.2)] bg-black">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
            </div>

            <div className="flex gap-4">
              <button
                onClick={stopCamera}
                className="flex-1 bg-white/5 border border-white/10 p-4 rounded-2xl font-bold text-sm"
              >
                CANCELAR
              </button>
              <button
                onClick={capturePhoto}
                className="flex-[2] bg-brand-primary text-black p-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg"
              >
                <Check size={20} /> CAPTURAR FOTO
              </button>
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
