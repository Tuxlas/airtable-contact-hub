import { useNavigate, Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import ContactForm from "@/components/contacts/ContactForm";
import { useCreateContact } from "@/hooks/use-airtable-queries";
import { ContactRecord } from "@/services/airtable-service";
import { sanitizeRecord } from "@/services/airtable-service";
import { toast } from "@/hooks/use-toast";

const CreateContactPage = () => {
  const navigate = useNavigate();
  const createContact = useCreateContact();

  const handleSubmit = async (data: ContactRecord) => {
    try {
      // Sanitize → solo campos válidos
      const sanitizedData = sanitizeRecord("Contactos", data);

      const result = await createContact.mutateAsync(sanitizedData);

      if (result?.id) {
        toast({
          title: "Contacto creado",
          description: "El contacto ha sido creado correctamente",
        });
        navigate(`/contacts/${result.id}`);
      } else {
        throw new Error("No se recibió un ID");
      }
    } catch (error) {
      console.error("Error creating contact:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el contacto. Verifica los datos.",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout title="Nuevo Contacto">
      <div className="mb-4">
        <Link to="/contacts" className="text-primary">← Volver</Link>
      </div>
      <ContactForm onSubmit={handleSubmit} isLoading={createContact.isPending} />
    </MainLayout>
  );
};

export default CreateContactPage;



