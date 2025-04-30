
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import ContactForm from "@/components/contacts/ContactForm";
import { Phone, Mail, Building, MapPin, Globe, Calendar, Trash2, Edit } from "lucide-react";
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
    try {
      await updateContact.mutateAsync(data);
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

  // Find related records
  const companyName = contact?.fields.Empresa?.[0]
    ? companies?.find((c) => c.id === contact.fields.Empresa?.[0])?.fields.Nombre
    : undefined;

  const locationName = contact?.fields.Sede?.[0]
    ? locations?.find((l) => l.id === contact.fields.Sede?.[0])?.fields.Ciudad
    : undefined;

  const sectorName = contact?.fields.Sector?.[0]
    ? sectors?.find((s) => s.id === contact.fields.Sector?.[0])?.fields.Nombre
    : undefined;

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
      // Remove non-numeric characters for WhatsApp
      const phone = contact.fields.Telefono.replace(/\D/g, "");
      window.open(`https://wa.me/${phone}`, "_blank");
    }
  };

  const handleAddToContacts = () => {
    if (!contact) return;
    
    // Create vCard data
    const vCardData = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${contact.fields.Nombre || ""}`,
      `TITLE:${contact.fields.Cargo || ""}`,
      `TEL:${contact.fields.Telefono || ""}`,
      `EMAIL:${contact.fields.Email || ""}`,
      `ORG:${companyName || ""}`,
      `ADR:;;${contact.fields.Direccion || ""};${contact.fields.Ciudad || ""};${contact.fields.Pais || ""}`,
      `URL:${contact.fields.Web || ""}`,
      "END:VCARD"
    ].join("\n");

    // Create and download the vCard file
    const blob = new Blob([vCardData], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `${contact.fields.Nombre || "contact"}.vcf`;
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

  return (
    <MainLayout>
      <div className="flex justify-between mb-4">
        <Link to="/contacts" className="text-primary">
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
                <AlertDialogTitle>¿Eliminar contacto?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se eliminará permanentemente este contacto de la base de datos.
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
        <ContactForm
          initialData={contact}
          onSubmit={handleSubmit}
          isLoading={updateContact.isPending}
        />
      ) : (
        <Tabs defaultValue="info">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Información</TabsTrigger>
            <TabsTrigger value="actions">Acciones</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="pt-4">
            <div className="mb-6 flex items-center">
              {contact.fields["Tarjeta Escaneada"] && 
               contact.fields["Tarjeta Escaneada"].length > 0 ? (
                <div className="w-20 h-20 rounded-full overflow-hidden mr-4">
                  <img
                    src={contact.fields["Tarjeta Escaneada"][0]}
                    alt={contact.fields.Nombre}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary/10 mr-4 flex items-center justify-center">
                  <span className="text-primary text-xl font-medium">
                    {contact.fields.Nombre?.charAt(0) || "?"}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-2xl font-medium text-text-title mb-1">
                  {contact.fields.Nombre || "Sin nombre"}
                </h1>
                <p className="text-text-body">
                  {contact.fields.Cargo || "Sin cargo"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {contact.fields.Email && (
                <div className="flex items-center">
                  <Mail size={18} className="mr-3 text-gray-500" />
                  <span>{contact.fields.Email}</span>
                </div>
              )}

              {contact.fields.Telefono && (
                <div className="flex items-center">
                  <Phone size={18} className="mr-3 text-gray-500" />
                  <span>{contact.fields.Telefono}</span>
                </div>
              )}

              {companyName && (
                <div className="flex items-center">
                  <Building size={18} className="mr-3 text-gray-500" />
                  <span>{companyName}</span>
                </div>
              )}

              {(locationName || sectorName) && (
                <div className="flex items-center">
                  <MapPin size={18} className="mr-3 text-gray-500" />
                  <span>
                    {locationName || ""}{" "}
                    {locationName && sectorName ? " - " : ""}
                    {sectorName || ""}
                  </span>
                </div>
              )}

              {contact.fields.Direccion && (
                <div className="flex items-center">
                  <MapPin size={18} className="mr-3 text-gray-500" />
                  <span>
                    {contact.fields.Direccion}
                    {contact.fields.Ciudad && `, ${contact.fields.Ciudad}`}
                    {contact.fields.Pais && `, ${contact.fields.Pais}`}
                  </span>
                </div>
              )}

              {contact.fields.Web && (
                <div className="flex items-center">
                  <Globe size={18} className="mr-3 text-gray-500" />
                  <a
                    href={
                      contact.fields.Web.startsWith("http")
                        ? contact.fields.Web
                        : `https://${contact.fields.Web}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    {contact.fields.Web}
                  </a>
                </div>
              )}

              {contact.fields.Fuente && (
                <div className="flex items-start">
                  <div className="mt-1">
                    <Calendar size={18} className="mr-3 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Fuente</p>
                    <p>{contact.fields.Fuente}</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="actions" className="pt-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleCall}
                disabled={!contact.fields.Telefono}
                className="flex flex-col items-center py-6 h-auto"
              >
                <Phone size={24} className="mb-2" />
                <span>Llamar</span>
              </Button>

              <Button
                onClick={handleEmail}
                disabled={!contact.fields.Email}
                className="flex flex-col items-center py-6 h-auto"
              >
                <Mail size={24} className="mb-2" />
                <span>Enviar Email</span>
              </Button>

              <Button
                onClick={handleWhatsApp}
                disabled={!contact.fields.Telefono}
                className="flex flex-col items-center py-6 h-auto"
                variant="outline"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  className="mb-2 fill-current"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span>WhatsApp</span>
              </Button>

              <Button
                onClick={handleAddToContacts}
                className="flex flex-col items-center py-6 h-auto"
                variant="outline"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  className="mb-2 fill-current"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <path d="M8 21h8" />
                  <path d="M12 17v4" />
                  <path d="m9 10 3-3 3 3" />
                  <path d="M12 13V7" />
                </svg>
                <span>Añadir a agenda</span>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </MainLayout>
  );
};

export default ContactDetailPage;
