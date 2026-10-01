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
     */
    public function index(Request $request): JsonResponse
    {
        $query = Ticket::with([
            'category',
            'creator',
            'assignedTechnician',
            'asset',
        ]);

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
     */
    public function show(Ticket $ticket): JsonResponse
    {
        $ticket->load([
            'category',
            'creator',
            'assignedTechnician',
            'asset',
            'comments.user',
            'history.user',
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
    $validated = $request->validate([
        'title' => ['required', 'string', 'max:255'],
        'description' => ['required', 'string'],
        'priority' => ['required', 'in:low,medium,high,critical'],
        'category_id' => ['required', 'exists:ticket_categories,id'],
        'created_by' => ['required', 'exists:users,id'],
        'assigned_to' => ['nullable', 'exists:users,id'],
        'asset_id' => ['nullable', 'exists:assets,id'],
    ]);

    $nextNumber = Ticket::max('id') + 1;

    $validated['code'] = sprintf(
        'INC-%s-%06d',
        now()->year,
        $nextNumber
    );

    $validated['status'] = 'open';

    // Registrar fecha de asignación si hay técnico
    if (!empty($validated['assigned_to'])) {
        $validated['assigned_at'] = now();
    }

    $ticket = Ticket::create($validated);

    // Historial: ticket creado
    TicketHistory::create([
        'ticket_id' => $ticket->id,
        'user_id' => $ticket->created_by,
        'action' => 'created',
        'field' => null,
        'old_value' => null,
        'new_value' => 'open',
    ]);

    // Historial: técnico asignado
    if ($ticket->assigned_to) {
        TicketHistory::create([
            'ticket_id' => $ticket->id,
            'user_id' => $ticket->assigned_to,
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
     */
    public function update(Request $request, Ticket $ticket): JsonResponse
{
    $validated = $request->validate([
        'title' => ['sometimes', 'string', 'max:255'],
        'description' => ['sometimes', 'string'],
        'priority' => ['sometimes', 'in:low,medium,high,critical'],
        'status' => ['sometimes', 'in:open,in_progress,resolved,closed'],
        'category_id' => ['sometimes', 'exists:ticket_categories,id'],
        'assigned_to' => ['nullable', 'exists:users,id'],
        'asset_id' => ['nullable', 'exists:assets,id'],
        'updated_by' => ['required', 'exists:users,id'],
    ]);

    $updatedBy = $validated['updated_by'];

    unset($validated['updated_by']);

    /*
     * Guardamos los valores anteriores
     * para poder crear el historial.
     */
    $oldStatus = $ticket->status;
    $oldPriority = $ticket->priority;
    $oldAssignedTo = $ticket->assigned_to;

    /*
     * Si se asigna un técnico nuevo,
     * registramos la fecha de asignación.
     */
    if (
        array_key_exists('assigned_to', $validated)
        && $validated['assigned_to'] !== $oldAssignedTo
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

        if (
            in_array($validated['status'], ['open', 'in_progress'])
        ) {
            $validated['resolved_at'] = null;
            $validated['closed_at'] = null;
        }
    }

    $ticket->update($validated);

    /*
     * Historial de cambio de estado.
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
     * Historial de cambio de prioridad.
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
     * Historial de cambio de técnico.
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
     */
    public function destroy(Ticket $ticket): JsonResponse
    {
        $ticket->delete();

        return response()->json([
            'message' => 'Ticket eliminado correctamente.',
        ]);
    }
}