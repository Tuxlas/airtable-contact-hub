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
      const sanitizedData = sanitizeRecord("Contactos", data);

      const result = await createContact.mutateAsync(sanitizedData);
      if (result?.id) {
        navigate(`/contacts/${result.id}`);
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
        <Link to="/contacts" className="text-primary">
          ← Volver
        </Link>
      </div>
      <ContactForm onSubmit={handleSubmit} isLoading={createContact.isPending} />
    </MainLayout>
  );
};

export default CreateContactPage;

