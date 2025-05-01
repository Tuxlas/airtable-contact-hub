
import { useNavigate, Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import LocationForm from "@/components/locations/LocationForm";
import { useCreateLocation } from "@/hooks/use-airtable-queries";
import { SedeRecord } from "@/services/airtable-service";

const CreateLocationPage = () => {
  const navigate = useNavigate();
  const createLocation = useCreateLocation();

  const handleSubmit = async (data: SedeRecord) => {
    try {
      const result = await createLocation.mutateAsync(data);
      if (result?.id) {
        navigate(`/locations/${result.id}`);
      }
    } catch (error) {
      console.error("Error creating location:", error);
    }
  };

  return (
    <MainLayout title="Nueva Sede">
      <div className="mb-4">
        <Link to="/companies" className="text-primary">
          ← Volver
        </Link>
      </div>
      <LocationForm onSubmit={handleSubmit} isLoading={createLocation.isPending} />
    </MainLayout>
  );
};

export default CreateLocationPage;
