<?php

namespace App\Http\Requests\Task;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreTaskRequest extends FormRequest
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
            'title' => 'required|string|max:255|min:3',
            'description' => 'required|string|min:10',
            'status' => 'sometimes|in:pending,in_progress,completed',
            'due_date' => 'nullable|date|after_or_equal:today',
            'priority_id' => 'required|exists:priorities,id',
            'tag_ids' => 'sometimes|array|min:1',
            'tag_ids.*' => 'integer|exists:tags,id'
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'title.required' => 'El título es obligatorio.',
            'title.min' => 'El título debe tener al menos 3 caracteres.',
            'title.max' => 'El título no puede exceder 255 caracteres.',
            'description.required' => 'La descripción es obligatoria.',
            'description.min' => 'La descripción debe tener al menos 10 caracteres.',
            'status.in' => 'El estado debe ser: pendiente, en_progreso o completada.',
            'due_date.date' => 'La fecha de vencimiento debe ser una fecha válida.',
            'due_date.after_or_equal' => 'La fecha de vencimiento debe ser hoy o una fecha futura.',
            'priority_id.required' => 'La prioridad es obligatoria.',
            'priority_id.exists' => 'La prioridad seleccionada no existe.',
            'tag_ids.array' => 'Las etiquetas deben ser un arreglo.',
            'tag_ids.min' => 'Debe seleccionar al menos una etiqueta.',
            'tag_ids.*.exists' => 'Una o más etiquetas seleccionadas no existen.'
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'title' => 'título',
            'description' => 'descripción',
            'status' => 'estado',
            'due_date' => 'fecha de vencimiento',
            'priority_id' => 'prioridad',
            'tag_ids' => 'etiquetas'
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        if (!$this->has('status')) {
            $this->merge(['status' => 'pending']);
        }

        // Clean tag_ids if empty
        if ($this->has('tag_ids') && empty($this->tag_ids)) {
            $this->request->remove('tag_ids');
        }
    }
}
