'use client';

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';

interface RegistrationFormProps {
  onSuccess: () => void;
  editData?: {
    domain: string;
    name: string;
    id: string;
    photoUrl?: string;
    isDemo: boolean;
  } | null;
  onCancelEdit?: () => void;
}

export default function RegistrationForm({ onSuccess, editData, onCancelEdit }: RegistrationFormProps) {
  const [newDomain, setNewDomain] = useState('');
  const [newName, setNewName] = useState('');
  const [newId, setNewId] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newIsDemo, setNewIsDemo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!editData;

  // Když se změní editData (klikneme na "Upravit"), naplníme formulář
  useEffect(() => {
    if (editData) {
      setNewDomain(editData.domain);
      setNewName(editData.name);
      setNewId(editData.id);
      setNewPhotoUrl(editData.photoUrl || '');
      setNewIsDemo(editData.isDemo || false);
    } else {
      setNewDomain('');
      setNewName('');
      setNewId('');
      setNewPhotoUrl('');
      setNewIsDemo(false);
    }
  }, [editData]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain || !newName || !newId) return;

    setIsSubmitting(true);
    try {
      await fetch('/api/advisors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: newDomain,
          id: newId,
          name: newName,
          role: 'Vázaný zástupce 4fin',
          photoUrl: newPhotoUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80',
          email: `${newName.split(' ')[0].toLowerCase()}@4fin.cz`,
          phone: '+420 000 000 000',
          isDemo: newIsDemo
        })
      });

      // Vyresetujeme formulář po úspěšném odeslání, pokud neupravujeme
      if (!isEditing) {
        setNewDomain('');
        setNewName('');
        setNewId('');
        setNewPhotoUrl('');
        setNewIsDemo(false);
      }
      
      onSuccess(); // Obnoví data v rodiči
    } catch (error) {
      console.error('Chyba při ukládání:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="registration-form" className="glass-panel p-6">
      <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
        <Plus className="text-[#D9005B]" /> {isEditing ? 'Úprava domény' : 'Registrace domény'}
      </h2>
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#888888] uppercase tracking-wider mb-2">Doména (bez https://)</label>
          <input 
            type="text" 
            required
            value={newDomain}
            onChange={e => setNewDomain(e.target.value)}
            disabled={isEditing || isSubmitting}
            placeholder="např. novy-poradce.cz" 
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#D9005B] focus:ring-1 focus:ring-[#D9005B] outline-none text-white transition-all disabled:opacity-50"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#888888] uppercase tracking-wider mb-2">Jméno poradce</label>
          <input 
            type="text" 
            required
            value={newName}
            onChange={e => setNewName(e.target.value)}
            disabled={isSubmitting}
            placeholder="např. Jan Novák" 
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#D9005B] focus:ring-1 focus:ring-[#D9005B] outline-none text-white transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#888888] uppercase tracking-wider mb-2">ID poradce (4fin)</label>
          <input 
            type="text" 
            required
            value={newId}
            onChange={e => setNewId(e.target.value)}
            disabled={isSubmitting}
            placeholder="např. 4F-12345" 
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#D9005B] focus:ring-1 focus:ring-[#D9005B] outline-none text-white transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#888888] uppercase tracking-wider mb-2">Profilová fotka</label>
          <div className="flex gap-4 items-center">
            {newPhotoUrl && (
              <img src={newPhotoUrl} alt="Preview" className="w-12 h-12 rounded-full object-cover border border-white/10" />
            )}
            <div className="flex-1 space-y-2">
              <input 
                type="text" 
                value={newPhotoUrl.startsWith('data:image') ? 'Nahraný obrázek (Base64)' : newPhotoUrl}
                onChange={e => setNewPhotoUrl(e.target.value)}
                disabled={isSubmitting || newPhotoUrl.startsWith('data:image')}
                placeholder="Vložte URL nebo nahrajte z počítače ->" 
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#D9005B] outline-none text-white transition-all disabled:opacity-50"
              />
              <div className="flex justify-between items-center">
                {newPhotoUrl.startsWith('data:image') && (
                  <button type="button" onClick={() => setNewPhotoUrl('')} className="text-xs text-red-500 hover:underline">Odstranit obrázek</button>
                )}
              </div>
            </div>
            <label className="bg-[#D9005B]/20 hover:bg-[#D9005B]/30 border border-[#D9005B]/50 text-[#D9005B] px-4 py-3 rounded-xl cursor-pointer transition-colors text-sm font-bold whitespace-nowrap">
              Nahrát fotku
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const img = new Image();
                      img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        // Resize to 256x256 max
                        const MAX_SIZE = 256;
                        let width = img.width;
                        let height = img.height;
                        if (width > height) {
                          if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
                        } else {
                          if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
                        }
                        canvas.width = width;
                        canvas.height = height;
                        ctx?.drawImage(img, 0, 0, width, height);
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                        setNewPhotoUrl(dataUrl);
                      };
                      img.src = event.target?.result as string;
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
          </div>
        </div>
        <div className="flex items-center gap-2 pt-2 pb-2">
          <input 
            type="checkbox" 
            id="isDemo"
            checked={newIsDemo}
            onChange={e => setNewIsDemo(e.target.checked)}
            disabled={isSubmitting}
            className="w-4 h-4 bg-black/50 border-white/10 rounded accent-[#D9005B]"
          />
          <label htmlFor="isDemo" className="text-sm text-[#888888] cursor-pointer hover:text-white transition-colors">
            Jedná se o ukázkový web (nezapočítává se do statistik)
          </label>
        </div>
        <div className="flex gap-2 mt-2">
          <button type="submit" disabled={isSubmitting} className="flex-1 bg-[#D9005B] hover:bg-[#D9005B]/80 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 flex justify-center">
            {isSubmitting ? 'Ukládám...' : (isEditing ? 'Uložit změny' : 'Přidat do Whitelistu')}
          </button>
          {isEditing && (
            <button 
              type="button" 
              onClick={onCancelEdit}
              disabled={isSubmitting}
              className="px-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
            >
              Zrušit
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
