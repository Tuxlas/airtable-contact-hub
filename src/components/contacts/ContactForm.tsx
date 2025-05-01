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
  CompanyRecord,
  SedeRecord,
  SectorRecord,
} from "@/services/airtable-service";
import { 
  useCompanies,
  useLocations,
  useSectors,
  useGetRecordById
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
    initialData?.fields["Tarjeta Escaneada"]?.[0] || null
  );

  const { data: companies } = useCompanies();
  const { data: locations } = useLocations();
  const { data: sectors } = useSectors();

  const form = useForm<ContactRecord>({
    defaultValues: {
      Nombre: initialData?.fields.Nombre || "",
      Cargo: initialData?.fields.Cargo || "",
      Email: initialData?.fields.Email || "",
      Teléfono: initialData?.fields.Teléfono || "", // Fixed: Teléfono with accent
      Dirección: initialData?.fields.Dirección || "",
      Ciudad: initialData?.fields.Ciudad || "",
      País: initialData?.fields.País || "",
      Web: initialData?.fields.Web || "",
      Fuente: initialData?.fields.Fuente || "",
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 1MB)
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
    // Add image if there's a preview
    if (imagePreview) {
      data["Tarjeta Escaneada"] = [imagePreview];
    }
    onSubmit(data);
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
          <FormField
            control={form.control}
            name="Nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre*</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre completo" {...field} required />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="Cargo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cargo</FormLabel>
                <FormControl>
                  <Input placeholder="Cargo" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="Email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Email" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="Teléfono"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input placeholder="Teléfono" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormItem>
            <FormLabel>Empresa</FormLabel>
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
                    {company.fields.Nombre || "Sin nombre"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>

          <FormItem>
            <FormLabel>Sede</FormLabel>
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

          <FormItem>
            <FormLabel>Sector</FormLabel>
            <Select 
              onValueChange={(value) => form.setValue("Sector", [value])}
              defaultValue={initialData?.fields.Sector?.[0]}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar sector" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {sectors?.map((sector) => (
                  <SelectItem key={sector.id} value={sector.id}>
                    {sector.fields.Nombre || "Sin nombre"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>

          <FormField
            control={form.control}
            name="Dirección"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección</FormLabel>
                <FormControl>
                  <Input placeholder="Dirección" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="Ciudad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ciudad</FormLabel>
                <FormControl>
                  <Input placeholder="Ciudad" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="País"
            render={({ field }) => (
              <FormItem>
                <FormLabel>País</FormLabel>
                <FormControl>
                  <Input placeholder="País" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="Web"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Web</FormLabel>
                <FormControl>
                  <Input placeholder="Sitio web" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="Fuente"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fuente</FormLabel>
                <FormControl>
                  <Input placeholder="Fuente del contacto" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
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
