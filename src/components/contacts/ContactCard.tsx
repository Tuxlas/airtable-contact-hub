
import { Card } from "@/components/ui/card";
import { Phone, Mail, Building, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { ContactRecord } from "@/services/airtable-service";
import { AirtableRecord } from "@/services/airtable-service";

interface ContactCardProps {
  contact: AirtableRecord<ContactRecord>;
}

const ContactCard = ({ contact }: ContactCardProps) => {
  const { Nombre, Cargo, Email, Telefono } = contact.fields;
  const empresaNombre = contact.fields.Empresa && contact.fields.Empresa.length > 0 
    ? contact.fields.Empresa[0] 
    : null;

  return (
    <Card className="mb-4 shadow-sm overflow-hidden">
      <Link to={`/contacts/${contact.id}`} className="flex items-center p-4 hover:bg-gray-50 relative">
        <div className="flex-shrink-0 mr-4">
          {contact.fields["Tarjeta Escaneada"] && contact.fields["Tarjeta Escaneada"].length > 0 ? (
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
              <img
                src={contact.fields["Tarjeta Escaneada"][0]}
                alt={Nombre}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary/10">
              <span className="text-primary text-lg font-medium">
                {Nombre?.charAt(0) || "?"}
              </span>
            </div>
          )}
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
          {Telefono && (
            <p className="text-sm text-text-body">
              {Telefono}
            </p>
          )}
        </div>
        <ChevronRight className="text-gray-400" size={20} />
      </Link>
    </Card>
  );
};

export default ContactCard;
