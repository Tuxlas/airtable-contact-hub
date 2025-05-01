
import { useNavigate, Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import CompanyForm from "@/components/companies/CompanyForm";
import { useCreateCompany } from "@/hooks/use-airtable-queries";
import { CompanyRecord } from "@/services/airtable-service";

const CreateCompanyPage = () => {
  const navigate = useNavigate();
  const createCompany = useCreateCompany();

  const handleSubmit = async (data: CompanyRecord) => {
    try {
      const result = await createCompany.mutateAsync(data);
      if (result?.id) {
        navigate(`/companies/${result.id}`);
      }
    } catch (error) {
      console.error("Error creating company:", error);
    }
  };

  return (
    <MainLayout title="Nueva Empresa">
      <div className="mb-4">
        <Link to="/companies" className="text-primary">
          ← Volver
        </Link>
      </div>
      <CompanyForm onSubmit={handleSubmit} isLoading={createCompany.isPending} />
    </MainLayout>
  );
};

export default CreateCompanyPage;
