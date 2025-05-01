
import { useParams, useNavigate, Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import {
  useSector,
  useUpdateSector,
  useDeleteSector,
  useCompanies,
} from "@/hooks/use-airtable-queries";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import SectorForm from "@/components/sectors/SectorForm";
import { PieChart, Building, Trash2, Edit } from "lucide-react";
import { useState } from "react";
import { SectorRecord } from "@/services/airtable-service";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";

const SectorDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: sector, isLoading } = useSector(id || "");
  const updateSector = useUpdateSector(id || "");
  const deleteSector = useDeleteSector();
  const { data: companies } = useCompanies();

  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = async (data: SectorRecord) => {
    try {
      await updateSector.mutateAsync(data);
      setIsEditing(false);
      toast({
        title: "Sector actualizado",
        description: "Los cambios se han guardado correctamente",
      });
    } catch (error) {
      console.error("Error updating sector:", error);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteSector.mutateAsync(id);
      toast({
        title: "Sector eliminado",
        description: "El sector ha sido eliminado correctamente",
      });
      navigate("/companies");
    } catch (error) {
      console.error("Error deleting sector:", error);
    }
  };

  // Filter companies related to this sector
  const relatedCompanies = companies?.filter(
    company => company.fields.Sector?.includes(id || "")
  );

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-32 w-full" />
        </div>
      </MainLayout>
    );
  }

  if (!sector) {
    return (
      <MainLayout>
        <div className="text-center py-8">
          <h2 className="text-xl mb-4">Sector no encontrado</h2>
          <Link to="/companies">
            <Button>Volver a sectores</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={sector.fields.NombreSector || "Detalle del Sector"}>
      <div className="flex justify-between mb-4">
        <Link to="/companies" className="text-primary">
          ← Volver
        </Link>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit size={16} className="mr-1" />
            {isEditing ? "Cancelar" : "Editar"}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 size={16} className="mr-1" />
                Eliminar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar sector?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se eliminará permanentemente este sector de la base de datos.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {isEditing ? (
        <SectorForm
          initialData={sector}
          onSubmit={handleSubmit}
          isLoading={updateSector.isPending}
        />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center mb-6">
            <div className="h-12 w-12 rounded-full bg-primary/10 mr-4 flex items-center justify-center">
              <PieChart className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-medium text-text-title">
              {sector.fields.NombreSector || "Sin nombre"}
            </h1>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-medium mb-3">Empresas en este sector</h2>
            {relatedCompanies && relatedCompanies.length > 0 ? (
              <div className="space-y-2">
                {relatedCompanies.map((company) => (
                  <Link key={company.id} to={`/companies/${company.id}`}>
                    <Card className="p-3 hover:bg-gray-50">
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{company.fields.NombreEmpresa}</span>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No hay empresas asociadas a este sector</p>
            )}
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default SectorDetailPage;
