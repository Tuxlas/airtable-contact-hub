
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
  SedeRecord,
  AirtableRecord,
} from "@/services/airtable-service";
import { useCompanies } from "@/hooks/use-airtable-queries";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface LocationFormProps {
  initialData?: AirtableRecord<SedeRecord>;
  onSubmit: (data: SedeRecord) => void;
  isLoading: boolean;
}

const LocationForm = ({ initialData, onSubmit, isLoading }: LocationFormProps) => {
  const { data: companies } = useCompanies();

  const form = useForm<SedeRecord>({
    defaultValues: {
      Ciudad: initialData?.fields.Ciudad || "",
      País: initialData?.fields.País || "",
      Dirección: initialData?.fields.Dirección || "",
    },
  });

  const handleSubmit = (data: SedeRecord) => {
    console.log("Submitting location data:", data);
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="Ciudad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ciudad*</FormLabel>
                <FormControl>
                  <Input placeholder="Ciudad" {...field} required />
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
                    {company.fields.NombreEmpresa || "Sin nombre"}
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

export default LocationForm;
