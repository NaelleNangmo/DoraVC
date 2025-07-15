import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FileText, Clock, CheckCircle, AlertCircle, Trash2, Eye, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/use-auth';
import { applicationService, type VisaApplication, type CreateApplicationData } from '@/lib/services/applicationService';
import { toast } from 'sonner';
import countries from '@/data/countries.json';

interface ApplicationCardProps {
  application: VisaApplication;
  onUpdate: (updates: Partial<VisaApplication>) => void;
  onDelete: (id: number) => void;
  onView: (application: VisaApplication) => void;
}

const ApplicationCard = ({ application, onUpdate, onDelete, onView }: ApplicationCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'processing': return 'bg-blue-500';
      case 'submitted': return 'bg-purple-500';
      case 'in_progress': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Brouillon';
      case 'in_progress': return 'En cours';
      case 'submitted': return 'Soumise';
      case 'processing': return 'En traitement';
      case 'approved': return 'Approuvée';
      case 'rejected': return 'Rejetée';
      case 'expired': return 'Expirée';
      default: return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'tourist': return '🏖️ Touriste';
      case 'student': return '🎓 Étudiant';
      case 'worker': return '💼 Travailleur';
      case 'resident': return '🏠 Résident';
      default: return type;
    }
  };

  const country = countries.find(c => c.code === application.country_code);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
      className="preserve-3d"
    >
      <Card className="professional-card">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">{country?.flag || '🌍'}</span>
              <div>
                <CardTitle className="text-lg">
                  {country?.name || application.country_code}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {getTypeLabel(application.application_type)}
                </p>
              </div>
            </div>
            <Badge className={`${getStatusColor(application.status)} text-white`}>
              {getStatusLabel(application.status)}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progression</span>
              <span>{application.progress_percentage}%</span>
            </div>
            <Progress value={application.progress_percentage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Étape {application.current_step} sur {application.total_steps}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Créée le</p>
              <p className="font-medium">
                {new Date(application.created_at).toLocaleDateString('fr-FR')}
              </p>
            </div>
            {application.reference_number && (
              <div>
                <p className="text-muted-foreground">Référence</p>
                <p className="font-medium font-mono text-xs">
                  {application.reference_number}
                </p>
              </div>
            )}
          </div>

          {application.estimated_cost && (
            <div className="text-sm">
              <p className="text-muted-foreground">Coût estimé</p>
              <p className="font-medium text-primary">
                {application.estimated_cost} {application.currency}
              </p>
            </div>
          )}

          <div className="flex space-x-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(application)}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-1" />
              Voir
            </Button>
            
            {application.status === 'draft' && (
              <Button
                size="sm"
                onClick={() => onView(application)}
                className="flex-1"
              >
                <Edit className="h-4 w-4 mr-1" />
                Continuer
              </Button>
            )}
            
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(application.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const CreateApplicationModal = ({ 
  isOpen, 
  onClose, 
  onCreate 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onCreate: (data: CreateApplicationData) => void; 
}) => {
  const [formData, setFormData] = useState<CreateApplicationData>({
    countryCode: '',
    applicationType: 'tourist'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.countryCode) {
      toast.error('Veuillez sélectionner un pays');
      return;
    }
    onCreate(formData);
    onClose();
    setFormData({ countryCode: '', applicationType: 'tourist' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nouvelle Démarche de Visa</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="country">Pays de destination *</Label>
            <Select 
              value={formData.countryCode} 
              onValueChange={(value) => setFormData({ ...formData, countryCode: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un pays" />
              </SelectTrigger>
              <SelectContent>
                {countries.map(country => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.flag} {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="type">Type de demande *</Label>
            <Select 
              value={formData.applicationType} 
              onValueChange={(value: any) => setFormData({ ...formData, applicationType: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tourist">🏖️ Touriste</SelectItem>
                <SelectItem value="student">🎓 Étudiant</SelectItem>
                <SelectItem value="worker">💼 Travailleur</SelectItem>
                <SelectItem value="resident">🏠 Résident permanent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" className="flex-1">
              Créer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const ApplicationsList = () => {
  const [applications, setApplications] = useState<VisaApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const loadApplications = async () => {
      if (!isAuthenticated) return;
      
      try {
        setIsLoading(true);
        const apps = await applicationService.getApplications();
        setApplications(apps);
      } catch (error) {
        console.error('Erreur lors du chargement des démarches:', error);
        toast.error('Erreur lors du chargement des démarches');
      } finally {
        setIsLoading(false);
      }
    };

    loadApplications();
  }, [isAuthenticated]);

  const handleCreateNew = async (data: CreateApplicationData) => {
    try {
      const newApp = await applicationService.createApplication(data);
      setApplications(prev => [newApp, ...prev]);
      toast.success('Nouvelle démarche créée !');
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      toast.error('Erreur lors de la création de la démarche');
    }
  };

  const handleUpdate = async (id: number, updates: Partial<VisaApplication>) => {
    try {
      const updatedApp = await applicationService.updateApplication(id, updates);
      setApplications(prev => prev.map(app => app.id === id ? updatedApp : app));
      toast.success('Démarche mise à jour');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette démarche ?')) return;
    
    try {
      await applicationService.deleteApplication(id);
      setApplications(prev => prev.filter(app => app.id !== id));
      toast.success('Démarche supprimée');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleView = (application: VisaApplication) => {
    // Rediriger vers la page de détail/édition
    window.location.href = `/visa-steps?application=${application.id}`;
  };

  const filteredApplications = applications.filter(app => 
    filterStatus === 'all' || app.status === filterStatus
  );

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Connexion requise</h3>
        <p className="text-muted-foreground">
          Connectez-vous pour voir vos démarches de visa
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="h-10 w-32 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Mes Démarches de Visa</h2>
          <p className="text-muted-foreground">
            Gérez toutes vos demandes de visa en un seul endroit
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              <SelectItem value="draft">Brouillons</SelectItem>
              <SelectItem value="in_progress">En cours</SelectItem>
              <SelectItem value="submitted">Soumises</SelectItem>
              <SelectItem value="processing">En traitement</SelectItem>
              <SelectItem value="approved">Approuvées</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Démarche
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {filteredApplications.length > 0 ? (
          <div className="grid gap-6">
            {filteredApplications.map(app => (
              <ApplicationCard
                key={app.id}
                application={app}
                onUpdate={(updates) => handleUpdate(app.id, updates)}
                onDelete={handleDelete}
                onView={handleView}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {filterStatus === 'all' ? 'Aucune démarche' : 'Aucune démarche correspondante'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {filterStatus === 'all' 
                ? 'Commencez votre première démarche de visa'
                : 'Aucune démarche ne correspond à ce filtre'
              }
            </p>
            {filterStatus === 'all' && (
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Commencer ma première démarche
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <CreateApplicationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateNew}
      />
    </div>
  );
};