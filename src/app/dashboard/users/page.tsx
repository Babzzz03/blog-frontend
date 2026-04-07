'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Trash2, Users, ShieldCheck, UserPlus } from 'lucide-react';
import { userService } from '@/services/user.service';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { User } from '@/types';
import { format } from 'date-fns';

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [lastMonth, setLastMonth] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ username: '', email: '', bio: '', isAdmin: false });
  const [saving, setSaving] = useState(false);
  const limit = 10;

  const load = async (p = 1) => {
    setIsLoading(true);
    try {
      const data = await userService.getUsers({ startIndex: (p - 1) * limit, limit });
      setUsers(data.users);
      setTotal(data.totalUsers);
      setLastMonth(data.lastMonthUsers);
    } catch {
      toast({ title: 'Error', description: 'Failed to load users', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(page); }, [page]);

  const openEdit = (u: User) => {
    setEditUser(u);
    setEditForm({ username: u.username, email: u.email, bio: u.bio || '', isAdmin: u.isAdmin });
  };

  const saveEdit = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      await userService.adminUpdateUser(editUser._id, editForm);
      toast({ title: 'User updated' });
      setEditUser(null);
      load(page);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (u: User) => {
    if (u._id === currentUser?._id) {
      toast({ title: 'Cannot delete yourself', variant: 'destructive' });
      return;
    }
    if (!confirm(`Delete user "${u.username}"?`)) return;
    try {
      await userService.deleteUser(u._id);
      toast({ title: 'User deleted' });
      load(page);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const totalPages = Math.ceil(total / limit);
  const admins = users.filter((u) => u.isAdmin).length;

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">Users</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><Users className="h-4 w-4" />Total Users</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{total}</div><p className="text-xs text-muted-foreground mt-1">+{lastMonth} last 30 days</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><ShieldCheck className="h-4 w-4" />Admins</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{users.filter((u) => u.isAdmin).length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><UserPlus className="h-4 w-4" />Regular Users</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{total - admins}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>All Users</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-10 text-muted-foreground">Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={u.profilePicture} />
                          <AvatarFallback>{u.username[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{u.username}</span>
                        {u._id === currentUser?._id && <span className="text-xs text-muted-foreground">(you)</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      <Badge variant={u.isAdmin ? 'default' : 'secondary'}>
                        {u.isAdmin ? 'Admin' : 'User'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{format(new Date(u.createdAt), 'MMM d, yyyy')}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(u)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(u)} disabled={u._id === currentUser?._id}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-muted-foreground">{total} total users</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Edit User</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Username</Label>
              <Input value={editForm.username} onChange={(e) => setEditForm((p) => ({ ...p, username: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={editForm.email} onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Bio</Label>
              <Input value={editForm.bio} onChange={(e) => setEditForm((p) => ({ ...p, bio: e.target.value }))} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium text-sm">Admin Access</p>
                <p className="text-xs text-muted-foreground">Grant full dashboard access</p>
              </div>
              <Switch checked={editForm.isAdmin} onCheckedChange={(v) => setEditForm((p) => ({ ...p, isAdmin: v }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>Cancel</Button>
            <Button onClick={saveEdit} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
