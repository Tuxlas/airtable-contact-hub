
import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { generateVCardQRCodeURL, downloadVCard } from "@/utils/vcard-utils";

const MyVCardPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    company: "",
    email: "",
    phone: "",
  });
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerateQRCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    
    const qrUrl = generateVCardQRCodeURL(formData);
    setQrCodeUrl(qrUrl);
  };

  const handleDownload = () => {
    if (!formData.name) return;
    downloadVCard(formData);
  };

  return (
    <MainLayout title="Mi vCard">
      <div className="max-w-md mx-auto">
        <Card className="p-6 mb-6">
          <form onSubmit={handleGenerateQRCode} className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre*</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Tu nombre completo"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="title">Cargo</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Tu cargo o profesión"
              />
            </div>
            
            <div>
              <Label htmlFor="company">Empresa</Label>
              <Input
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Nombre de tu empresa"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Tu email"
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Tu número de teléfono"
              />
            </div>
            
            <Button type="submit" className="w-full">
              Generar Código QR
            </Button>
          </form>
        </Card>
        
        {qrCodeUrl && (
          <Card className="p-6 flex flex-col items-center">
            <h2 className="text-xl font-medium mb-4">Tu vCard</h2>
            <div className="bg-white p-4 rounded-lg shadow mb-4">
              <img
                src={qrCodeUrl}
                alt="vCard QR Code"
                className="max-w-full h-auto"
              />
            </div>
            <Button onClick={handleDownload} variant="outline">
              Descargar vCard (.vcf)
            </Button>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default MyVCardPage;
