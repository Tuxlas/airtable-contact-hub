
import { useNavigate, Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import SectorForm from "@/components/sectors/SectorForm";
import { useCreateSector } from "@/hooks/use-airtable-queries";
import { SectorRecord } from "@/services/airtable-service";

const CreateSectorPage = () => {
  const navigate = useNavigate();
  const createSector = useCreateSector();

  const handleSubmit = async (data: SectorRecord) => {
    try {
      const result = await createSector.mutateAsync(data);
      if (result?.id) {
        navigate(`/sectors/${result.id}`);
      }
    } catch (error) {
      console.error("Error creating sector:", error);
    }
  };

  return (
    <MainLayout title="Nuevo Sector">
      <div className="mb-4">
        <Link to="/companies" className="text-primary">
          ← Volver
        </Link>
      </div>
      <SectorForm onSubmit={handleSubmit} isLoading={createSector.isPending} />
    </MainLayout>
  );
};

export default CreateSectorPage;
