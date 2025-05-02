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
      toast({
        title: "Contacto actualizado",
        description: "Los datos del contacto fueron guardados correctamente",
      });
    } catch (error) {
      console.error("Error updating contact:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el contacto",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteContact.mutateAsync(id);
      toast({
        title: "Contacto eliminado",
        description: "El contacto fue eliminado correctamente",
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

  const nombreCompleto = contact?.fields.Apellidos
    ? `${contact?.fields.Nombre || ""} ${contact?.fields.Apellidos}`
    : contact?.fields.Nombre || "";

  const handleCall = () => {
    if (contact?.fields.Telefono) {
      window.location.href = `tel:${contact.fields.Telefono}`;
    }
  };

  const handleEmail = () => {
    if (contact?.fields.Email) {
      window.location.href = `mailto:${contact.fields.Email}`;
    }
  };

  const handleWhatsApp = () => {
    if (contact?.fields.Telefono) {
      const phone = contact.fields.Telefono.toString().replace(/\D/g, "");
      window.open(`https://wa.me/${phone}`, "_blank");
    }
  };

  const handleAddToContacts = () => {
    if (!contact) return;

    const vCardData = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${nombreCompleto}`,
      `TITLE:${contact.fields.Cargo || ""}`,
      `TEL:${contact.fields.Telefono || ""}`,
      `EMAIL:${contact.fields.Email || ""}`,
      `ORG:${companyName || ""}`,
      `ADR:;;${contact.fields.Direccion || ""};${contact.fields.Ciudad || ""};${contact.fields.Pais || ""}`,
      `URL:${contact.fields.WebEmpresa || ""}`,
      "END:VCARD"
    ].join("\n");

    const blob = new Blob([vCardData], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `${nombreCompleto || "contacto"}.vcf`;
    link.href = url;
    link.click();
  };

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

  return (
    <MainLayout>
      <div className="flex justify-between mb-6">
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
                <AlertDialogDescription>
                  Esta acción no se puede deshacer.
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
        <ContactForm initialData={contact} onSubmit={handleSubmit} isLoading={updateContact.isPending} />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center mb-6">
            {contact.fields.TarjetaEscaneada?.[0] ? (
              <img src={contact.fields.TarjetaEscaneada[0]} alt={nombreCompleto} className="w-20 h-20 rounded-full object-cover mr-4" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary/10 mr-4 flex items-center justify-center">
                <UserRound className="h-10 w-10 text-primary" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-medium">{nombreCompleto}</h1>
              <p className="text-gray-500">{contact.fields.Cargo || "Sin cargo"}</p>
            </div>
          </div>

          <div className="space-y-4">
            {contact.fields.Email && <p><Mail size={18} className="inline mr-2" /> {contact.fields.Email}</p>}
            {contact.fields.Telefono && <p><Phone size={18} className="inline mr-2" /> {contact.fields.Telefono}</p>}
            {companyName && <p><Building size={18} className="inline mr-2" /> {companyName}</p>}
            {locationName && <p><MapPin size={18} className="inline mr-2" /> {locationName}</p>}
            {sectorName && <p><MapPin size={18} className="inline mr-2" /> {sectorName}</p>}
            {contact.fields.Direccion && <p><MapPin size={18} className="inline mr-2" /> {contact.fields.Direccion}</p>}
            {contact.fields.WebEmpresa && <p><Globe size={18} className="inline mr-2" /> <a href={contact.fields.WebEmpresa} target="_blank" rel="noopener noreferrer">{contact.fields.WebEmpresa}</a></p>}
            {contact.fields.Fuente && <p><Calendar size={18} className="inline mr-2" /> {contact.fields.Fuente}</p>}
          </div>

          <div className="mt-8 space-x-2">
            <Button onClick={handleCall} disabled={!contact.fields.Telefono}><Phone size={16} className="mr-2" /> Llamar</Button>
            <Button onClick={handleEmail} disabled={!contact.fields.Email}><Mail size={16} className="mr-2" /> Email</Button>
            <Button onClick={handleWhatsApp} disabled={!contact.fields.Telefono}>WhatsApp</Button>
            <Button onClick={handleAddToContacts}>Añadir</Button>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default ContactDetailPage;
