
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
  CompanyRecord,
  AirtableRecord,
  SectorRecord,
} from "@/services/airtable-service";
import { useSectors } from "@/hooks/use-airtable-queries";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface CompanyFormProps {
  initialData?: AirtableRecord<CompanyRecord>;
  onSubmit: (data: CompanyRecord) => void;
  isLoading: boolean;
}

const CompanyForm = ({ initialData, onSubmit, isLoading }: CompanyFormProps) => {
  const { data: sectors } = useSectors();

  const form = useForm<CompanyRecord>({
    defaultValues: {
      Nombre: initialData?.fields.Nombre || "",
      Web: initialData?.fields.Web || "",
      Tags: initialData?.fields.Tags || [],
      "Número de Sedes": initialData?.fields["Número de Sedes"] || 0,
      "Número de Contactos": initialData?.fields["Número de Contactos"] || 0,
    },
  });

  const handleSubmit = (data: CompanyRecord) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="Nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre*</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre de la empresa" {...field} required />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="Web"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sitio web</FormLabel>
                <FormControl>
                  <Input placeholder="URL del sitio web" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          
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

export default CompanyForm;
