import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import {
  ContactRecord,
  AirtableRecord,
  sanitizeRecord
} from "@/services/airtable-service";
import { 
  useCompanies,
  useLocations,
  useSectors,
} from "@/hooks/use-airtable-queries";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Camera } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ContactFormProps {
  initialData?: AirtableRecord<ContactRecord>;
  onSubmit: (data: ContactRecord) => void;
  isLoading: boolean;
}

const ContactForm = ({ initialData, onSubmit, isLoading }: ContactFormProps) => {
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.fields.TarjetaEscaneada?.[0] || null
  );

  const { data: companies } = useCompanies();
  const { data: locations } = useLocations();
  const { data: sectors } = useSectors();

  const form = useForm<ContactRecord>({
    defaultValues: {
      Nombre: initialData?.fields.Nombre || "",
      Apellidos: initialData?.fields.Apellidos || "",
      Cargo: initialData?.fields.Cargo || "",
      Email: initialData?.fields.Email || "",
      Telefono: initialData?.fields.Telefono || "",
      Direccion: initialData?.fields.Direccion || "",
      Ciudad: initialData?.fields.Ciudad || "",
      Pais: initialData?.fields.Pais || "",
      Fuente: initialData?.fields.Fuente || "",
      WebEmpresa: initialData?.fields.WebEmpresa || "",
      SectorName: initialData?.fields.SectorName || "",
      Empresa: initialData?.fields.Empresa || [],
      Sede: initialData?.fields.Sede || [],
      Sector: initialData?.fields.Sector || [],
    },
  });

  const empresaId = form.watch("Empresa")?.[0];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      toast({
        title: "Error",
        description: "La imagen debe ser menor a 1MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImagePreview(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (data: ContactRecord) => {
    const sanitizedData = sanitizeRecord("Contactos", data);

    if (imagePreview) {
      sanitizedData.TarjetaEscaneada = [imagePreview];
    }

    onSubmit(sanitizedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 mb-8">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Tarjeta escaneada"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Camera size={32} className="text-gray-400" />
              )}
            </div>
            <label 
              htmlFor="image-upload" 
              className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full cursor-pointer"
            >
              <Camera size={16} />
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Campos básicos */}
          {[
            { name: "Nombre", label: "Nombre*", required: true },
            { name: "Apellidos", label: "Apellidos*", required: true },
            { name: "Cargo", label: "Cargo" },
            { name: "Email", label: "Email*", required: true },
            { name: "Telefono", label: "Teléfono" },
            { name: "Direccion", label: "Dirección" },
            { name: "Ciudad", label: "Ciudad" },
            { name: "Pais", label: "País" },
            { name: "WebEmpresa", label: "Web de la Empresa" },
            { name: "Fuente", label: "Fuente" },
          ].map(({ name, label, required }) => (
            <FormField
              key={name}
              control={form.control}
              name={name as keyof ContactRecord}
              rules={{ required: required ? "Este campo es obligatorio" : false }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{label}</FormLabel>
                  <FormControl>
                    <Input placeholder={label} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          ))}

          {/* Empresa (obligatorio) */}
          <FormItem>
            <FormLabel>Empresa*</FormLabel>
            <Select 
              onValueChange={(value) => form.setValue("Empresa", [value])}
              defaultValue={initialData?.fields.Empresa?.[0]}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar empresa" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {companies?.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.fields.NombreEmpresa || "Sin nombre"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>

          {/* Sede (obligatorio solo si hay Empresa) */}
          {empresaId && (
            <FormItem>
              <FormLabel>Sede*</FormLabel>
              <Select 
                onValueChange={(value) => form.setValue("Sede", [value])}
                defaultValue={initialData?.fields.Sede?.[0]}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar sede" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {locations?.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.fields.Ciudad || "Sin nombre"}, {location.fields.Pais || ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}

          {/* Sector (solo lectura en edición) */}
          {initialData && (
            <FormItem>
              <FormLabel>Sector (autogenerado)</FormLabel>
              <Input
                disabled
                value={(initialData.fields.SectorName || []).join(", ")}
              />
            </FormItem>
          )}
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ContactForm;



