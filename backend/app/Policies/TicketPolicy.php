<?php

namespace App\Policies;

use App\Models\Ticket;
use App\Models\User;

class TicketPolicy
{
    /**
     * Ver listado de tickets.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }


    /**
     * Ver un ticket concreto.
     */
    public function view(User $user, Ticket $ticket): bool
    {
        $role = $user->role?->slug;

        // Administrador y técnico ven todos
        if (in_array($role, ['admin', 'technician'], true)) {
            return true;
        }

        // Usuario solo ve sus propios tickets
        return $ticket->created_by === $user->id;
    }


    /**
     * Crear tickets.
     */
    public function create(User $user): bool
    {
        return $user->active === true;
    }


    /**
     * Actualizar tickets.
     */
    public function update(User $user, Ticket $ticket): bool
    {
        $role = $user->role?->slug;


        // Admin puede todo
        if ($role === 'admin') {
            return true;
        }


        // Técnico solo sus tickets asignados
        if ($role === 'technician') {
            return $ticket->assigned_to === $user->id;
        }


        // Usuario no modifica tickets
        return false;
    }


    /**
     * Eliminar tickets.
     */
    public function delete(User $user, Ticket $ticket): bool
    {
        return $user->role?->slug === 'admin';
    }


    /**
     * Restaurar.
     */
    public function restore(User $user, Ticket $ticket): bool
    {
        return $user->role?->slug === 'admin';
    }


    /**
     * Eliminación permanente.
     */
    public function forceDelete(User $user, Ticket $ticket): bool
    {
        return $user->role?->slug === 'admin';
    }
}