<?php
// app/Http/Requests/Task/UpdateTaskRequest.php

namespace App\Http\Requests\Task;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class UpdateTaskRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'title' => 'sometimes|string|max:255|min:3',
            'description' => 'sometimes|string|min:10',
            'status' => 'sometimes|in:pending,in_progress,completed',
            'due_date' => 'sometimes|nullable|date',
            'priority_id' => 'sometimes|exists:priorities,id',
            'tag_ids' => 'sometimes|array',
            'tag_ids.*' => 'integer|exists:tags,id'
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'title.min' => 'El título debe tener al menos 3 caracteres.',
            'title.max' => 'El título no puede exceder 255 caracteres.',
            'description.min' => 'La descripción debe tener al menos 10 caracteres.',
            'status.in' => 'El estado debe ser: pendiente, en_progreso o completada.',
            'due_date.date' => 'La fecha de vencimiento debe ser una fecha válida.',
            'priority_id.exists' => 'La prioridad seleccionada no existe.',
            'tag_ids.array' => 'Las etiquetas deben ser un arreglo.',
            'tag_ids.*.exists' => 'Una o más etiquetas seleccionadas no existen.'
        ];
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Error de validación',
            'errors' => $validator->errors()
        ], 422));
    }
}