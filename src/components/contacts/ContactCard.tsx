
import { Card } from "@/components/ui/card";
import { Phone, Mail, Building } from "lucide-react";
import { Link } from "react-router-dom";
import { ContactRecord } from "@/services/airtable-service";
import { AirtableRecord } from "@/services/airtable-service";

interface ContactCardProps {
  contact: AirtableRecord<ContactRecord>;
}

const ContactCard = ({ contact }: ContactCardProps) => {
  const { Nombre, Cargo, Email, Telefono } = contact.fields;

  return (
    <Card className="p-4 mb-4 card-shadow hover:shadow-lg transition-shadow">
      <Link to={`/contacts/${contact.id}`} className="block">
        <div className="flex items-center mb-3">
          {contact.fields["Tarjeta Escaneada"] && contact.fields["Tarjeta Escaneada"].length > 0 ? (
            <div className="w-12 h-12 rounded-full overflow-hidden mr-3 bg-gray-200">
              <img
                src={contact.fields["Tarjeta Escaneada"][0]}
                alt={Nombre}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full mr-3 bg-primary/10 flex items-center justify-center">
              <span className="text-primary text-lg font-medium">
                {Nombre?.charAt(0) || "?"}
              </span>
            </div>
          )}
          <div>
            <h3 className="font-medium text-text-title">{Nombre || "Sin nombre"}</h3>
            <p className="text-sm text-text-body">{Cargo || "Sin cargo"}</p>
          </div>
        </div>
        <div className="space-y-2">
          {Email && (
            <div className="flex items-center text-sm">
              <Mail size={14} className="mr-2 text-gray-500" />
              <span className="truncate">{Email}</span>
            </div>
          )}
          {Telefono && (
            <div className="flex items-center text-sm">
              <Phone size={14} className="mr-2 text-gray-500" />
              <span>{Telefono}</span>
            </div>
          )}
          {contact.fields.Empresa && contact.fields.Empresa.length > 0 && (
            <div className="flex items-center text-sm">
              <Building size={14} className="mr-2 text-gray-500" />
              <span className="truncate">ID: {contact.fields.Empresa[0]}</span>
            </div>
          )}
        </div>
      </Link>
    </Card>
  );
};

export default ContactCard;
