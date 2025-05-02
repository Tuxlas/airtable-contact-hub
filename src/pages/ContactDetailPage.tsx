import { useParams, useNavigate, Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import {
  useContact,
  useUpdateContact,
  useDeleteContact,
  useCompanies,
  useLocations,
  useSectors,
} from "@/hooks/use-airtable-queries";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ContactForm from "@/components/contacts/ContactForm";
import { Phone, Mail, Building, MapPin, Globe, Calendar, Trash2, Edit, UserRound } from "lucide-react";
import { useState } from "react";
import { ContactRecord } from "@/services/airtable-service";
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
import { sanitizeRecord } from "@/services/airtable-service";

const ContactDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: contact, isLoading } = useContact(id || "");
  const updateContact = useUpdateContact(id || "");
  const deleteContact = useDeleteContact();

  const { data: companies } = useCompanies();
  const { data: locations } = useLocations();
  const { data: sectors } = useSectors();

  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = async (data: ContactRecord) => {
    const sanitizedData = sanitizeRecord("Contactos", data);

    try {
      await updateContact.mutateAsync(sanitizedData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating contact:", error);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteContact.mutateAsync(id);
      toast({
        title: "Contacto eliminado",
        description: "El contacto ha sido eliminado correctamente",
      });
      navigate("/contacts");
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  };

  const companyName = contact?.fields.Empresa?.[0]
    ? companies?.find((c) => c.id === contact.fields.Empresa?.[0])?.fields.NombreEmpresa
    : undefined;

  const locationName = contact?.fields.Sede?.[0]
    ? locations?.find((l) => l.id === contact.fields.Sede?.[0])?.fields.Ciudad
    : undefined;

  const sectorName = contact?.fields.Sector?.[0]
    ? sectors?.find((s) => s.id === contact.fields.Sector?.[0])?.fields.NombreSector
    : undefined;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </MainLayout>
    );
  }

  if (!contact) {
    return (
      <MainLayout>
        <div className="text-center py-8">
          <h2 className="text-xl mb-4">Contacto no encontrado</h2>
          <Link to="/contacts">
            <Button>Volver a contactos</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  const nombreCompleto = contact.fields.Apellidos
    ? `${contact.fields.Nombre || ""} ${contact.fields.Apellidos}`
    : contact.fields.Nombre || "";

  return (
    <MainLayout>
      <div className="flex justify-between mb-4">
        <Link to="/contacts" className="text-primary">← Volver</Link>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
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
                <AlertDialogTitle>¿Eliminar contacto?</AlertDialogTitle>
                <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
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
        <ContactForm initialData={contact} onSubmit={handleSubmit} isLoading={updateContact.isPending} />
      ) : (
        <div className="space-y-6">
          <div className="mb-6 flex items-center">
            {contact.fields.TarjetaEscaneada?.length ? (
              <div className="w-20 h-20 rounded-full overflow-hidden mr-4">
                <img src={contact.fields.TarjetaEscaneada[0]} alt={nombreCompleto} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary/10 mr-4 flex items-center justify-center">
                <UserRound className="h-10 w-10 text-primary" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-medium text-text-title mb-1">{nombreCompleto || "Sin nombre"}</h1>
              <p className="text-text-body">{contact.fields.Cargo || "Sin cargo"}</p>
            </div>
          </div>

          <div className="space-y-4">
            {contact.fields.Email && <div className="flex items-center"><Mail size={18} className="mr-3 text-gray-500" /><span>{contact.fields.Email}</span></div>}
            {contact.fields.Telefono && <div className="flex items-center"><Phone size={18} className="mr-3 text-gray-500" /><span>{contact.fields.Telefono}</span></div>}
            {companyName && <div className="flex items-center"><Building size={18} className="mr-3 text-gray-500" /><span>{companyName}</span></div>}
            {(locationName || sectorName) && <div className="flex items-center"><MapPin size={18} className="mr-3 text-gray-500" /><span>{locationName || ""} {locationName && sectorName ? " - " : ""}{sectorName || ""}</span></div>}
            {contact.fields.Direccion && <div className="flex items-center"><MapPin size={18} className="mr-3 text-gray-500" /><span>{contact.fields.Direccion}{contact.fields.Ciudad && `, ${contact.fields.Ciudad}`}{contact.fields.Pais && `, ${contact.fields.Pais}`}</span></div>}
            {contact.fields.WebEmpresa && <div className="flex items-center"><Globe size={18} className="mr-3 text-gray-500" /><a href={contact.fields.WebEmpresa[0]} target="_blank" rel="noopener noreferrer" className="text-primary underline">{contact.fields.WebEmpresa[0]} (Empresa)</a></div>}
            {contact.fields.Fuente && <div className="flex items-start"><div className="mt-1"><Calendar size={18} className="mr-3 text-gray-500" /></div><div><p className="text-sm text-gray-500 mb-1">Fuente</p><p>{contact.fields.Fuente}</p></div></div>}
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default ContactDetailPage;






