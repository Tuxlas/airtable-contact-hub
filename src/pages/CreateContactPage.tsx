
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import ContactForm from "@/components/contacts/ContactForm";
import { useCreateContact } from "@/hooks/use-airtable-queries";
import { ContactRecord } from "@/services/airtable-service";

const CreateContactPage = () => {
  const navigate = useNavigate();
  const createContact = useCreateContact();

  const handleSubmit = async (data: ContactRecord) => {
    try {
      const result = await createContact.mutateAsync(data);
      if (result?.id) {
        navigate(`/contacts/${result.id}`);
      }
    } catch (error) {
      console.error("Error creating contact:", error);
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
