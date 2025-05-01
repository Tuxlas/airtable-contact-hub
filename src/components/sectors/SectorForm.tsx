
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
  SectorRecord,
  AirtableRecord,
} from "@/services/airtable-service";

interface SectorFormProps {
  initialData?: AirtableRecord<SectorRecord>;
  onSubmit: (data: SectorRecord) => void;
  isLoading: boolean;
}

const SectorForm = ({ initialData, onSubmit, isLoading }: SectorFormProps) => {
  const form = useForm<SectorRecord>({
    defaultValues: {
      NombreSector: initialData?.fields.NombreSector || "",
    },
  });

  const handleSubmit = (data: SectorRecord) => {
    console.log("Submitting sector data:", data);
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="NombreSector"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Sector*</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre del sector" {...field} required />
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

export default SectorForm;
