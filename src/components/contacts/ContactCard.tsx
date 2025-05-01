
import { Card } from "@/components/ui/card";
import { Phone, Mail, Building, ChevronRight, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { ContactRecord } from "@/services/airtable-service";
import { AirtableRecord } from "@/services/airtable-service";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ContactCardProps {
  contact: AirtableRecord<ContactRecord>;
}

const ContactCard = ({ contact }: ContactCardProps) => {
  const { Nombre, Cargo, Email, Teléfono } = contact.fields;
  const empresaNombre = contact.fields.Empresa && contact.fields.Empresa.length > 0 
    ? contact.fields.Empresa[0] 
    : null;

  return (
    <Card className="mb-4 shadow-sm overflow-hidden">
      <Link to={`/contacts/${contact.id}`} className="flex items-center p-4 hover:bg-gray-50 relative">
        <div className="flex-shrink-0 mr-4">
          <Avatar className="h-12 w-12">
            {contact.fields["Tarjeta Escaneada"] && contact.fields["Tarjeta Escaneada"].length > 0 ? (
              <AvatarImage 
                src={contact.fields["Tarjeta Escaneada"][0]} 
                alt={Nombre || "Contacto"} 
                className="object-cover"
              />
            ) : (
              <AvatarFallback className="bg-primary/10">
                <UserRound className="h-6 w-6 text-primary" />
              </AvatarFallback>
            )}
          </Avatar>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-medium text-text-title truncate">
            {Nombre || "Sin nombre"}
          </h3>
          <p className="text-sm text-text-body">
            {empresaNombre || Cargo || ""}
          </p>
          {Email && (
            <p className="text-sm text-text-body truncate">
              {Email}
            </p>
          )}
          {Teléfono && (
            <p className="text-sm text-text-body">
              {Teléfono}
            </p>
          )}
        </div>
        <ChevronRight className="text-gray-400" size={20} />
      </Link>
    </Card>
  );
};

export default ContactCard;
