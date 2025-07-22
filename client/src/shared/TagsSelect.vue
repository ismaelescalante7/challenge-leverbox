<template>
    <div class="relative">
      <Listbox
        v-model="selectedTags"
        multiple
        :disabled="disabled"
        @update:model-value="updateValue"
      >
        <div class="relative">
          <ListboxButton
            class="form-select flex items-center justify-between"
            :class="{ 'opacity-50 cursor-not-allowed': disabled }"
          >
            <span class="block truncate text-left">
              {{ displayText }}
            </span>
            <ChevronUpDownIcon class="h-5 w-5 text-gray-400" />
          </ListboxButton>
  
          <transition
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <ListboxOptions
              class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
            >
              <ListboxOption
                v-for="tag in tags"
                :key="tag.id"
                v-slot="{ active, selected }"
                :value="tag.id"
                as="template"
              >
                <li
                  :class="[
                    active ? 'bg-blue-100 text-blue-900' : 'text-gray-900',
                    'relative cursor-pointer select-none py-2 pl-10 pr-4'
                  ]"
                >
                  <div class="flex items-center">
                    <span
                      v-if="tag.color"
                      class="inline-block h-3 w-3 rounded-full mr-3"
                      :style="{ backgroundColor: tag.color }"
                    ></span>
                    <span
                      :class="[
                        selected ? 'font-medium' : 'font-normal',
                        'block truncate'
                      ]"
                    >
                      {{ tag.name }}
                    </span>
                  </div>
                  <span
                    v-if="selected"
                    :class="[
                      active ? 'text-blue-600' : 'text-blue-600',
                      'absolute inset-y-0 left-0 flex items-center pl-3'
                    ]"
                  >
                    <CheckIcon class="h-5 w-5" />
                  </span>
                </li>
              </ListboxOption>
              
              <!-- Empty state -->
              <div
                v-if="tags.length === 0"
                class="relative cursor-default select-none py-2 px-4 text-gray-700"
              >
                No tags available
              </div>
            </ListboxOptions>
          </transition>
        </div>
      </Listbox>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import {
    Listbox,
    ListboxButton,
    ListboxOptions,
    ListboxOption
  } from '@headlessui/vue'
  import {
    CheckIcon,
    ChevronUpDownIcon
  } from '@heroicons/vue/20/solid'
  
  import type { Tag } from '@/types/task'
  
  interface Props {
    modelValue: number[]
    tags: Tag[]
    disabled?: boolean
    placeholder?: string
  }
  
  interface Emits {
    (e: 'update:modelValue', value: number[]): void
  }
  
  // Props & Emits
  const props = withDefaults(defineProps<Props>(), {
    disabled: false,
    placeholder: 'Select tags...'
  })
  
  const emit = defineEmits<Emits>()
  
  // Local state
  const selectedTags = ref<number[]>([])
  
  // Computed
  const displayText = computed(() => {
    if (selectedTags.value.length === 0) {
      return props.placeholder
    }
    
    if (selectedTags.value.length === 1) {
      const tag = props.tags.find(t => t.id === selectedTags.value[0])
      return tag?.name || 'Unknown tag'
    }
    
    return `${selectedTags.value.length} tags selected`
  })
  
  // Methods
  const updateValue = (value: number[]): void => {
    selectedTags.value = value
    emit('update:modelValue', value)
  }
  
  // Watchers
  watch(() => props.modelValue, (newValue) => {
    selectedTags.value = newValue || []
  }, { immediate: true })
  </script>