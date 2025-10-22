'use client';

import { useState } from 'react';
import { Send, Paperclip, X, CheckCircle, AlertCircle, Upload } from 'lucide-react';

interface Attachment {
  filename: string;
  content: string; // Base64
}

export default function SendEmailWithAttachments() {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [clientName, setClientName] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Gestion des fichiers
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: Attachment[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Vérifier la taille du fichier (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError(`Le fichier ${file.name} est trop volumineux (max 10MB)`);
        continue;
      }

      // Convertir en Base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Enlever le préfixe "data:...,base64,"
          const base64String = result.split(',')[1];
          resolve(base64String);
        };
        reader.readAsDataURL(file);
      });

      newAttachments.push({
        filename: file.name,
        content: base64
      });
    }

    setAttachments([...attachments, ...newAttachments]);
    // Reset l'input
    e.target.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('/api/admin/send-custom-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          to,
          subject,
          message,
          clientName,
          attachments: attachments.length > 0 ? attachments : undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        // Reset le formulaire
        setTo('');
        setSubject('');
        setMessage('');
        setClientName('');
        setAttachments([]);

        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError(data.message || 'Erreur lors de l\'envoi');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <Send className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">
            Envoyer un email avec documents
          </h2>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800 font-medium">Email envoyé avec succès !</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email destinataire */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email du destinataire *
            </label>
            <input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              required
              placeholder="client@exemple.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Nom du client */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom du client (optionnel)
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Marie Dupont"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Sujet */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sujet de l'email *
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              placeholder="Votre contrat LAIA Beauty"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message *
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={8}
              placeholder="Bonjour,&#10;&#10;Veuillez trouver ci-joint votre contrat LAIA Beauty.&#10;&#10;Merci de le signer et me le retourner.&#10;&#10;Cordialement,"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Pièces jointes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pièces jointes (PDF, DOCX, JPG, PNG... Max 10MB par fichier)
            </label>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center gap-3"
              >
                <Upload className="w-12 h-12 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Cliquez pour ajouter des fichiers
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    ou glissez-déposez vos documents ici
                  </p>
                </div>
              </label>
            </div>

            {/* Liste des fichiers */}
            {attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                {attachments.map((att, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <Paperclip className="w-5 h-5 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        {att.filename}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="p-1 hover:bg-red-100 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bouton d'envoi */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Envoi en cours...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Envoyer l'email
              </>
            )}
          </button>
        </form>

        {/* Aide */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Conseils</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Vous pouvez joindre plusieurs fichiers à la fois</li>
            <li>• Taille maximale par fichier : 10MB</li>
            <li>• Formats acceptés : PDF, Word, images (JPG, PNG), etc.</li>
            <li>• Le message sera automatiquement mis en forme avec votre signature</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
