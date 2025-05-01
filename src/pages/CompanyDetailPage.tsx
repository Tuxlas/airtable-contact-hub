
import { useParams, useNavigate, Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import {
  useCompany,
  useUpdateCompany,
  useDeleteCompany,
  useSectors,
  useLocations,
  useContacts,
} from "@/hooks/use-airtable-queries";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import CompanyForm from "@/components/companies/CompanyForm";
import { Building, MapPin, User, Globe, Trash2, Edit, PieChart } from "lucide-react";
import { useState } from "react";
import { CompanyRecord } from "@/services/airtable-service";
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

const CompanyDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: company, isLoading } = useCompany(id || "");
  const updateCompany = useUpdateCompany(id || "");
  const deleteCompany = useDeleteCompany();
  const { data: sectors } = useSectors();
  const { data: locations } = useLocations();
  const { data: contacts } = useContacts();

  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = async (data: CompanyRecord) => {
    try {
      await updateCompany.mutateAsync(data);
      setIsEditing(false);
      toast({
        title: "Empresa actualizada",
        description: "Los cambios se han guardado correctamente",
      });
    } catch (error) {
      console.error("Error updating company:", error);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteCompany.mutateAsync(id);
      toast({
        title: "Empresa eliminada",
        description: "La empresa ha sido eliminada correctamente",
      });
      navigate("/companies");
    } catch (error) {
      console.error("Error deleting company:", error);
    }
  };

  // Find related sector
  const sectorId = company?.fields.Sector?.[0];
  const relatedSector = sectors?.find(s => s.id === sectorId);

  // Filter locations related to this company
  const relatedLocations = locations?.filter(
    location => location.fields.Empresa?.includes(id || "")
  );

  // Filter contacts related to this company
  const relatedContacts = contacts?.filter(
    contact => contact.fields.Empresa?.includes(id || "")
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

  if (!company) {
    return (
      <MainLayout>
        <div className="text-center py-8">
          <h2 className="text-xl mb-4">Empresa no encontrada</h2>
          <Link to="/companies">
            <Button>Volver a empresas</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={company.fields.NombreEmpresa || "Detalle de Empresa"}>
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
                <AlertDialogTitle>¿Eliminar empresa?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se eliminará permanentemente esta empresa de la base de datos.
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
        <CompanyForm
          initialData={company}
          onSubmit={handleSubmit}
          isLoading={updateCompany.isPending}
        />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center mb-6">
            <div className="h-12 w-12 rounded-full bg-primary/10 mr-4 flex items-center justify-center">
              <Building className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-medium text-text-title">
                {company.fields.NombreEmpresa || "Sin nombre"}
              </h1>
              {relatedSector && (
                <p className="text-text-body">
                  Sector: {relatedSector.fields.NombreSector}
                </p>
              )}
            </div>
          </div>

          {company.fields.WebEmpresa && (
            <div className="flex items-center mb-4">
              <Globe size={18} className="mr-3 text-gray-500" />
              <a
                href={company.fields.WebEmpresa.startsWith("http") ? 
                  company.fields.WebEmpresa : `https://${company.fields.WebEmpresa}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                {company.fields.WebEmpresa}
              </a>
            </div>
          )}

          <div className="mt-6">
            <h2 className="text-lg font-medium mb-3">Sedes</h2>
            {relatedLocations && relatedLocations.length > 0 ? (
              <div className="space-y-2">
                {relatedLocations.map((location) => (
                  <Link key={location.id} to={`/locations/${location.id}`}>
                    <Card className="p-3 hover:bg-gray-50">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                        <span>
                          {location.fields.Ciudad}
                          {location.fields.País && `, ${location.fields.País}`}
                          {location.fields.Dirección && ` - ${location.fields.Dirección}`}
                        </span>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No hay sedes registradas</p>
            )}
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-medium mb-3">Contactos</h2>
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
              <p className="text-gray-500">No hay contactos asociados</p>
            )}
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default CompanyDetailPage;
