
import { useParams, useNavigate, Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import {
  useLocation,
  useUpdateLocation,
  useDeleteLocation,
  useCompanies,
  useContacts,
} from "@/hooks/use-airtable-queries";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import LocationForm from "@/components/locations/LocationForm";
import { MapPin, Building, User, Trash2, Edit } from "lucide-react";
import { useState } from "react";
import { SedeRecord } from "@/services/airtable-service";
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

const LocationDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: location, isLoading } = useLocation(id || "");
  const updateLocation = useUpdateLocation(id || "");
  const deleteLocation = useDeleteLocation();
  const { data: companies } = useCompanies();
  const { data: contacts } = useContacts();

  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = async (data: SedeRecord) => {
    try {
      await updateLocation.mutateAsync(data);
      setIsEditing(false);
      toast({
        title: "Sede actualizada",
        description: "Los cambios se han guardado correctamente",
      });
    } catch (error) {
      console.error("Error updating location:", error);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteLocation.mutateAsync(id);
      toast({
        title: "Sede eliminada",
        description: "La sede ha sido eliminada correctamente",
      });
      navigate("/companies");
    } catch (error) {
      console.error("Error deleting location:", error);
    }
  };

  // Find related company
  const companyId = location?.fields.Empresa?.[0];
  const relatedCompany = companies?.find(c => c.id === companyId);

  // Filter contacts related to this location
  const relatedContacts = contacts?.filter(
    contact => contact.fields.Sede?.includes(id || "")
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

  if (!location) {
    return (
      <MainLayout>
        <div className="text-center py-8">
          <h2 className="text-xl mb-4">Sede no encontrada</h2>
          <Link to="/companies">
            <Button>Volver a sedes</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  const { Ciudad, País, Dirección } = location.fields;
  const locationName = `${Ciudad || ""}${Ciudad && País ? ", " : ""}${País || ""}`;

  return (
    <MainLayout title={locationName || "Detalle de Sede"}>
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
                <AlertDialogTitle>¿Eliminar sede?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se eliminará permanentemente esta sede de la base de datos.
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
        <LocationForm
          initialData={location}
          onSubmit={handleSubmit}
          isLoading={updateLocation.isPending}
        />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center mb-6">
            <div className="h-12 w-12 rounded-full bg-primary/10 mr-4 flex items-center justify-center">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-medium text-text-title">
                {locationName || "Sin ubicación"}
              </h1>
              {Dirección && (
                <p className="text-text-body">{Dirección}</p>
              )}
            </div>
          </div>

          {relatedCompany && (
            <div className="mt-4">
              <h2 className="text-lg font-medium mb-2">Empresa</h2>
              <Link to={`/companies/${relatedCompany.id}`}>
                <Card className="p-3 hover:bg-gray-50">
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{relatedCompany.fields.NombreEmpresa}</span>
                  </div>
                </Card>
              </Link>
            </div>
          )}

          <div className="mt-8">
            <h2 className="text-lg font-medium mb-3">Contactos en esta sede</h2>
            {relatedContacts && relatedContacts.length > 0 ? (
              <div className="space-y-2">
                {relatedContacts.map((contact) => (
                  <Link key={contact.id} to={`/contacts/${contact.id}`}>
                    <Card className="p-3 hover:bg-gray-50">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-500" />
                        <span>
                          {contact.fields.Nombre} {contact.fields.Apellidos || ""}
                          {contact.fields.Cargo && ` - ${contact.fields.Cargo}`}
                        </span>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No hay contactos asociados a esta sede</p>
            )}
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default LocationDetailPage;
