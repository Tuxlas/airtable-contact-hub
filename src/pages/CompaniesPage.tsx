
import { useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { useCompanies } from "@/hooks/use-airtable-queries";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Building, MapPin, PieChart, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useSectors } from "@/hooks/use-airtable-queries";
import { useLocations } from "@/hooks/use-airtable-queries";

const CompaniesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: companies, isLoading: isLoadingCompanies } = useCompanies();
  const { data: sectors, isLoading: isLoadingSectors } = useSectors();
  const { data: locations, isLoading: isLoadingLocations } = useLocations();

  const filteredCompanies = companies?.filter((company) => {
    const searchLower = searchQuery.toLowerCase();
    const nombre = company.fields.NombreEmpresa?.toLowerCase() || "";
    return nombre.includes(searchLower);
  });

  const filteredSectors = sectors?.filter((sector) => {
    const searchLower = searchQuery.toLowerCase();
    const nombre = sector.fields.NombreSector?.toLowerCase() || "";
    return nombre.includes(searchLower);
  });

  const filteredLocations = locations?.filter((location) => {
    const searchLower = searchQuery.toLowerCase();
    const ciudad = location.fields.Ciudad?.toLowerCase() || "";
    const pais = location.fields.País?.toLowerCase() || "";
    return ciudad.includes(searchLower) || pais.includes(searchLower);
  });

  return (
    <MainLayout title="Empresas">
      <div className="mb-4">
        <div className="relative">
          <Input
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />
        </div>
      </div>

      <Tabs defaultValue="companies">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="companies">Empresas</TabsTrigger>
          <TabsTrigger value="locations">Sedes</TabsTrigger>
          <TabsTrigger value="sectors">Sectores</TabsTrigger>
        </TabsList>

        <TabsContent value="companies">
          {isLoadingCompanies ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-28 w-full" />
              ))}
            </div>
          ) : filteredCompanies && filteredCompanies.length > 0 ? (
            <div className="space-y-4">
              {filteredCompanies.map((company) => (
                <Link key={company.id} to={`/companies/${company.id}`}>
                  <Card className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-2">
                      <Building className="mr-2 text-gray-500" size={20} />
                      <h3 className="font-medium text-text-title">
                        {company.fields.NombreEmpresa || "Sin nombre"}
                      </h3>
                    </div>
                    <div className="text-sm text-text-body">
                      {company.fields.NumeroContactos !== undefined && (
                        <p>
                          {company.fields.NumeroContactos} contacto
                          {company.fields.NumeroContactos !== 1
                            ? "s"
                            : ""}
                        </p>
                      )}
                      {company.fields.NumeroSedes !== undefined && (
                        <p>
                          {company.fields.NumeroSedes} sede
                          {company.fields.NumeroSedes !== 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No se encontraron empresas</p>
            </div>
          )}

          <div className="fixed bottom-20 right-4">
            <Link to="/companies/new">
              <Button className="h-12 w-12 rounded-full" size="icon">
                <Plus />
              </Button>
            </Link>
          </div>
        </TabsContent>

        <TabsContent value="locations">
          {isLoadingLocations ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-28 w-full" />
              ))}
            </div>
          ) : filteredLocations && filteredLocations.length > 0 ? (
            <div className="space-y-4">
              {filteredLocations.map((location) => (
                <Link key={location.id} to={`/locations/${location.id}`}>
                  <Card className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-2">
                      <MapPin className="mr-2 text-gray-500" size={20} />
                      <h3 className="font-medium text-text-title">
                        {location.fields.Ciudad || "Sin ciudad"}
                        {location.fields.País && `, ${location.fields.País}`}
                      </h3>
                    </div>
                    {location.fields.Dirección && (
                      <p className="text-sm text-text-body">
                        {location.fields.Dirección}
                      </p>
                    )}
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No se encontraron sedes</p>
            </div>
          )}

          <div className="fixed bottom-20 right-4">
            <Link to="/locations/new">
              <Button className="h-12 w-12 rounded-full" size="icon">
                <Plus />
              </Button>
            </Link>
          </div>
        </TabsContent>

        <TabsContent value="sectors">
          {isLoadingSectors ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-28 w-full" />
              ))}
            </div>
          ) : filteredSectors && filteredSectors.length > 0 ? (
            <div className="space-y-4">
              {filteredSectors.map((sector) => (
                <Link key={sector.id} to={`/sectors/${sector.id}`}>
                  <Card className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-2">
                      <PieChart className="mr-2 text-gray-500" size={20} />
                      <h3 className="font-medium text-text-title">
                        {sector.fields.NombreSector || "Sin nombre"}
                      </h3>
                    </div>
                    {sector.fields.NumeroEmpresas && (
                      <p className="text-sm text-text-body">
                        {sector.fields.NumeroEmpresas} empresas
                      </p>
                    )}
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No se encontraron sectores</p>
            </div>
          )}

          <div className="fixed bottom-20 right-4">
            <Link to="/sectors/new">
              <Button className="h-12 w-12 rounded-full" size="icon">
                <Plus />
              </Button>
            </Link>
          </div>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default CompaniesPage;
