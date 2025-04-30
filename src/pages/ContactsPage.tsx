
import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import ContactCard from "@/components/contacts/ContactCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useContacts } from "@/hooks/use-airtable-queries";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

const ContactsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: contacts, isLoading } = useContacts();

  const filteredContacts = contacts?.filter((contact) => {
    const searchLower = searchQuery.toLowerCase();
    const nombre = contact.fields.Nombre?.toLowerCase() || "";
    const cargo = contact.fields.Cargo?.toLowerCase() || "";
    const email = contact.fields.Email?.toLowerCase() || "";
    
    return (
      nombre.includes(searchLower) ||
      cargo.includes(searchLower) ||
      email.includes(searchLower)
    );
  });

  return (
    <MainLayout title="Contactos">
      <div className="mb-4">
        <div className="relative">
          <Input
            placeholder="Buscar contactos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : filteredContacts && filteredContacts.length > 0 ? (
        <div>
          {filteredContacts.map((contact) => (
            <ContactCard key={contact.id} contact={contact} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No se encontraron contactos</p>
        </div>
      )}

      <div className="fixed bottom-20 right-4">
        <Link to="/contacts/new">
          <Button className="h-12 w-12 rounded-full" size="icon">
            <Plus />
          </Button>
        </Link>
      </div>
    </MainLayout>
  );
};

export default ContactsPage;
