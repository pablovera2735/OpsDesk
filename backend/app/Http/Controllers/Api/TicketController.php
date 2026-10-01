<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\TicketHistory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    /**
     * Listar tickets.
     *
     * Admin y técnicos pueden consultar todos.
     * Los usuarios normales solo sus propios tickets.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $roleSlug = $user?->role?->slug;

        if (!in_array($roleSlug, ['admin', 'technician', 'user'], true)) {
            return response()->json([
                'message' => 'No tienes un rol válido para consultar tickets.',
            ], 403);
        }

        $query = Ticket::with([
            'category',
            'creator',
            'assignedTechnician',
            'asset',
        ]);

        /*
         * Los usuarios normales solo pueden
         * consultar sus propios tickets.
         */
        if ($roleSlug === 'user') {
            $query->where('created_by', $user->id);
        }

        /*
         * Filtros.
         */
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('assigned_to')) {
            $query->where('assigned_to', $request->assigned_to);
        }

        $tickets = $query
            ->latest()
            ->paginate(10);

        return response()->json($tickets);
    }

    /**
     * Mostrar un ticket.
     *
     * Los usuarios normales solo pueden ver sus propios tickets.
     * Admin y técnicos pueden consultar cualquier ticket.
     */
    public function show(Request $request, Ticket $ticket): JsonResponse
    {
        $user = $request->user();

        $roleSlug = $user?->role?->slug;

        /*
         * Un usuario normal no puede consultar
         * tickets que no le pertenecen.
         */
        if (
            $roleSlug === 'user'
            && $ticket->created_by !== $user->id
        ) {
            return response()->json([
                'message' => 'No tienes permisos para consultar este ticket.',
            ], 403);
        }

        if (!in_array($roleSlug, ['admin', 'technician', 'user'], true)) {
            return response()->json([
                'message' => 'No tienes un rol válido para consultar tickets.',
            ], 403);
        }

        /*
         * Los comentarios internos solo son visibles
         * para administradores y técnicos.
         */
        $canSeeInternalComments = in_array(
            $roleSlug,
            ['admin', 'technician'],
            true
        );

        $ticket->load([
            'category',
            'creator',
            'assignedTechnician',
            'asset',

            'comments' => function ($query) use ($canSeeInternalComments) {
                if (!$canSeeInternalComments) {
                    $query->where('internal', false);
                }

                $query->with('user');
            },

            'history' => function ($query) use ($canSeeInternalComments) {
                if (!$canSeeInternalComments) {
                    $query->where(function ($history) {
                        $history
                            ->where('action', '!=', 'comment_added')
                            ->orWhere('new_value', '!=', 'internal');
                    });
                }

                $query->with('user');
            },
        ]);

        return response()->json([
            'data' => $ticket,
        ]);
    }

    /**
     * Crear un ticket.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        /*
         * IMPORTANTE:
         * No aceptamos created_by desde el cliente.
         *
         * Aunque alguien mande:
         *
         * "created_by": 1
         *
         * será ignorado y se utilizará siempre
         * el usuario autenticado.
         */
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'priority' => ['required', 'in:low,medium,high,critical'],
            'category_id' => ['required', 'exists:ticket_categories,id'],
            'assigned_to' => ['nullable', 'exists:users,id'],
            'asset_id' => ['nullable', 'exists:assets,id'],
        ]);

        /*
         * El creador SIEMPRE es el usuario autenticado.
         */
        $validated['created_by'] = $user->id;

        /*
         * Generar código del ticket.
         */
        $nextNumber = Ticket::max('id') + 1;

        $validated['code'] = sprintf(
            'INC-%s-%06d',
            now()->year,
            $nextNumber
        );

        /*
         * Estado inicial.
         */
        $validated['status'] = 'open';

        /*
         * Registrar fecha de asignación
         * si se ha asignado un técnico.
         */
        if (!empty($validated['assigned_to'])) {
            $validated['assigned_at'] = now();
        }

        $ticket = Ticket::create($validated);

        /*
         * Historial: ticket creado.
         *
         * El usuario del historial es el usuario
         * autenticado, nunca un ID enviado por el cliente.
         */
        TicketHistory::create([
            'ticket_id' => $ticket->id,
            'user_id' => $user->id,
            'action' => 'created',
            'field' => null,
            'old_value' => null,
            'new_value' => 'open',
        ]);

        /*
         * Historial: técnico asignado.
         *
         * user_id = quién realizó la acción.
         * new_value = técnico asignado.
         */
        if ($ticket->assigned_to) {
            TicketHistory::create([
                'ticket_id' => $ticket->id,
                'user_id' => $user->id,
                'action' => 'assigned',
                'field' => 'assigned_to',
                'old_value' => null,
                'new_value' => (string) $ticket->assigned_to,
            ]);
        }

        $ticket->load([
            'category',
            'creator',
            'assignedTechnician',
            'asset',
            'comments.user',
            'history.user',
        ]);

        return response()->json([
            'message' => 'Ticket creado correctamente.',
            'data' => $ticket,
        ], 201);
    }

    /**
     * Actualizar un ticket.
     *
     * La ruta ya está protegida para:
     * admin, technician.
     *
     * El usuario que realiza la modificación
     * se obtiene SIEMPRE del token.
     */
    public function update(
        Request $request,
        Ticket $ticket
    ): JsonResponse {
        $user = $request->user();

        $roleSlug = $user?->role?->slug;

        /*
         * Defensa adicional aunque la ruta ya tenga
         * RoleMiddleware.
         */
        if (!in_array($roleSlug, ['admin', 'technician'], true)) {
            return response()->json([
                'message' => 'No tienes permisos para actualizar tickets.',
            ], 403);
        }

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'string'],
            'priority' => ['sometimes', 'in:low,medium,high,critical'],
            'status' => ['sometimes', 'in:open,in_progress,resolved,closed'],
            'category_id' => ['sometimes', 'exists:ticket_categories,id'],
            'assigned_to' => ['nullable', 'exists:users,id'],
            'asset_id' => ['nullable', 'exists:assets,id'],
        ]);

        /*
         * NO aceptamos updated_by.
         *
         * Aunque el cliente mande:
         *
         * "updated_by": 1
         *
         * no se utilizará.
         */
        $updatedBy = $user->id;

        /*
         * Valores anteriores.
         */
        $oldStatus = $ticket->status;
        $oldPriority = $ticket->priority;
        $oldAssignedTo = $ticket->assigned_to;

        /*
         * Si cambia el técnico asignado,
         * actualizamos assigned_at.
         */
        if (
            array_key_exists('assigned_to', $validated)
            && $validated['assigned_to'] != $oldAssignedTo
        ) {
            $validated['assigned_at'] = $validated['assigned_to']
                ? now()
                : null;
        }

        /*
         * Fechas automáticas según el estado.
         */
        if (
            isset($validated['status'])
            && $validated['status'] !== $oldStatus
        ) {
            if ($validated['status'] === 'resolved') {
                $validated['resolved_at'] = now();
            }

            if ($validated['status'] === 'closed') {
                $validated['closed_at'] = now();
            }

            /*
             * Si vuelve a abierto/en progreso,
             * eliminamos las fechas de resolución/cierre.
             */
            if (
                in_array(
                    $validated['status'],
                    ['open', 'in_progress'],
                    true
                )
            ) {
                $validated['resolved_at'] = null;
                $validated['closed_at'] = null;
            }
        }

        $ticket->update($validated);

        /*
         * Historial: cambio de estado.
         */
        if (
            array_key_exists('status', $validated)
            && $validated['status'] !== $oldStatus
        ) {
            TicketHistory::create([
                'ticket_id' => $ticket->id,
                'user_id' => $updatedBy,
                'action' => 'status_changed',
                'field' => 'status',
                'old_value' => $oldStatus,
                'new_value' => $ticket->status,
            ]);
        }

        /*
         * Historial: cambio de prioridad.
         */
        if (
            array_key_exists('priority', $validated)
            && $validated['priority'] !== $oldPriority
        ) {
            TicketHistory::create([
                'ticket_id' => $ticket->id,
                'user_id' => $updatedBy,
                'action' => 'priority_changed',
                'field' => 'priority',
                'old_value' => $oldPriority,
                'new_value' => $ticket->priority,
            ]);
        }

        /*
         * Historial: cambio de técnico.
         */
        if (
            array_key_exists('assigned_to', $validated)
            && $validated['assigned_to'] != $oldAssignedTo
        ) {
            TicketHistory::create([
                'ticket_id' => $ticket->id,
                'user_id' => $updatedBy,
                'action' => 'assigned',
                'field' => 'assigned_to',
                'old_value' => $oldAssignedTo
                    ? (string) $oldAssignedTo
                    : null,
                'new_value' => $ticket->assigned_to
                    ? (string) $ticket->assigned_to
                    : null,
            ]);
        }

        $ticket->load([
            'category',
            'creator',
            'assignedTechnician',
            'asset',
            'comments.user',
            'history.user',
        ]);

        return response()->json([
            'message' => 'Ticket actualizado correctamente.',
            'data' => $ticket,
        ]);
    }

    /**
     * Eliminar un ticket.
     *
     * La ruta ya está protegida para admin.
     */
    public function destroy(
        Request $request,
        Ticket $ticket
    ): JsonResponse {
        $user = $request->user();

        if ($user?->role?->slug !== 'admin') {
            return response()->json([
                'message' => 'No tienes permisos para eliminar tickets.',
            ], 403);
        }

        $ticket->delete();

        return response()->json([
            'message' => 'Ticket eliminado correctamente.',
        ]);
    }
}