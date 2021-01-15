import React, { useState } from 'react';
import {
  ChipGroup,
  Chip,
  ToolbarItem,
  InputGroup,
  TextInput,
  Button,
  ButtonVariant,
  Select,
  SelectVariant,
  SelectOption,
  ToolbarToggleGroup,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  SelectOptionObject,
  ToolbarChip,
  SplitItem,
  Split,
  ToolbarFilter,
} from '@patternfly/react-core';
import { SearchIcon, FilterIcon } from '@patternfly/react-icons';
import { TablePagination } from './TablePagination';
import { useTranslation } from 'react-i18next';
import { FilterType, FilterValue } from './StreamsTableView';
import { cloudProviderOptions, cloudRegionOptions, statusOptions } from '@app/utils/utils';
import { getInitialFilter } from '@app/OpenshiftStreams/OpenshiftStreams';
import './StreamsToolbar.css';

type StreamsToolbarProps = {
  createStreamsInstance: boolean;
  setCreateStreamsInstance: (createStreamsInstance: boolean) => void;
  mainToggle: boolean;
  filterSelected?: string;
  setFilterSelected: (value: string) => void;
  total: number;
  page: number;
  perPage: number;
  filteredValue: Array<FilterType>;
  setFilteredValue: (filteredValue: Array<FilterType>) => void;
};

const StreamsToolbar: React.FunctionComponent<StreamsToolbarProps> = ({
  createStreamsInstance,
  setCreateStreamsInstance,
  setFilterSelected,
  filterSelected = 'name',
  total,
  page,
  perPage,
  filteredValue,
  setFilteredValue,
}) => {
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [isCloudProviderFilterExpanded, setIsCloudProviderFilterExpanded] = useState(false);
  const [isRegionFilterExpanded, setIsRegionFilterExpanded] = useState(false);
  const [isStatusFilterExpanded, setIsStatusFilterExpanded] = useState(false);
  const [nameInputValue, setNameInputValue] = useState<string | undefined>();
  const [ownerInputValue, setOwnerInputValue] = useState<string | undefined>();
  const { t } = useTranslation();
  // Options for server-side filtering
  const mainFilterOptions = [
    { label: t('name'), value: 'name', disabled: false },
    { label: t('cloud_provider'), value: 'cloud_provider', disabled: false },
    { label: t('region'), value: 'region', disabled: false },
    { label: t('owner'), value: 'owner', disabled: false },
    { label: t('status'), value: 'status', disabled: false },
  ];

  const cloudProviderFilterOptions = cloudProviderOptions.map((cloudProvider) => {
    return { label: t(cloudProvider.value), value: cloudProvider.value, disabled: false };
  });

  const regionFilterOptions = cloudRegionOptions.map((region) => {
    return { label: t(region.value), value: region.value, disabled: false };
  });

  const statusFilterOptions = statusOptions.map((status) => {
    return { label: t(status.value), value: status.value, disabled: false };
  });

  const onFilterToggle = () => {
    setIsFilterExpanded(!isFilterExpanded);
  };

  const onCloudProviderFilterToggle = () => {
    setIsCloudProviderFilterExpanded(!isCloudProviderFilterExpanded);
  };

  const onRegionFilterToggle = () => {
    setIsRegionFilterExpanded(!isRegionFilterExpanded);
  };

  const onStatusFilterToggle = () => {
    setIsStatusFilterExpanded(!isStatusFilterExpanded);
  };

  const onNameInputChange = (input?: string) => {
    setNameInputValue(input);
  };

  const onOwnerInputChange = (input?: string) => {
    setOwnerInputValue(input);
  };

  const onClear = () => {
    setFilteredValue(getInitialFilter() as FilterType[]);
  };

  const updateFilter = (key: string, filter: FilterValue, removeIfPresent: boolean) => {
    const newFilterValue: FilterType[] = Object.assign([], filteredValue); // a copy for applied filter
    const filterIndex = newFilterValue.findIndex((f) => f.filterKey === key); // index of current key in applied filter
    if (filterIndex > -1) {
      // if filter is present with the current key
      const filterValue = newFilterValue[filterIndex];
      if (filterValue.filterValue && filterValue.filterValue.length > 0) {
        // if some filters are already there in applied filter for same key
        const filterValues: FilterValue[] = Object.assign([], filterValue.filterValue); // a copy of applied filtered values
        const filterValueIndex = filterValue.filterValue.findIndex((f) => f.value === filter.value); // index of current filter value in applied filter
        if (filterValueIndex > -1) {
          // filter value is already present
          if (removeIfPresent) {
            // remove the value
            filterValue.filterValue.splice(filterValueIndex, 1);
          } else {
            // skip the duplicate values
            return;
          }
        } else {
          // delete current filter
          newFilterValue.splice(filterIndex, 1);
          // add filterValue at positoin 0 in values of the current key
          filterValues.splice(0, 0, filter);
          // add filter at position 0
          newFilterValue.splice(0, 0, { filterKey: key, filterValue: filterValues });
        }
      } else {
        //delete current filter from the array
        newFilterValue.splice(filterIndex, 1);
        // add filter at postion 0
        newFilterValue.splice(0, 0, { filterKey: key, filterValue: [filter] });
      }
    } else {
      // add filter at postion 0
      newFilterValue.splice(0, 0, { filterKey: key, filterValue: [filter] });
    }
    setFilteredValue(newFilterValue);
  };

  const onFilter = (filterType: string) => {
    if (filterType === 'name' && nameInputValue) {
      updateFilter('name', { value: nameInputValue, isExact: false }, false);
      setNameInputValue('');
    } else if (filterType === 'owner' && ownerInputValue) {
      updateFilter('owner', { value: ownerInputValue, isExact: false }, false);
      setOwnerInputValue('');
    }
  };

  const onChangeSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | React.ChangeEvent<Element>,
    selection: string | SelectOptionObject
  ) => {
    setIsFilterExpanded(!isFilterExpanded);
    setFilterSelected(selection?.toString());
  };

  const onCloudProviderFilterSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | React.ChangeEvent<Element>,
    selection: string | SelectOptionObject,
    isPlaceholder?: boolean | undefined
  ) => {
    if (isPlaceholder) clearSelection('cloud_provider');
    // uncomment next line in future when multi cloud provider is supported
    // updateFilter('cloud_provider', { value: selection.toString(), isExact: true }, true);
    setIsCloudProviderFilterExpanded(false);
  };

  const onRegionFilterSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | React.ChangeEvent<Element>,
    selection: string | SelectOptionObject,
    isPlaceholder?: boolean | undefined
  ) => {
    if (isPlaceholder) clearSelection('region');
    // uncomment next line in future when multi region is supported
    // updateFilter('region', { value: selection.toString(), isExact: true }, true);
    setIsRegionFilterExpanded(false);
  };

  const onStatusFilterSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | React.ChangeEvent<Element>,
    selection: string | SelectOptionObject,
    isPlaceholder?: boolean | undefined
  ) => {
    if (isPlaceholder) clearSelection('status');
    updateFilter('status', { value: selection.toString(), isExact: true }, true);
  };

  const clearSelection = (value: string) => {
    const copyFilteredValue: FilterType[] = Object.assign([], filteredValue);
    const filterIndex = copyFilteredValue.findIndex((filter) => filter.filterKey === value);
    if (filterIndex >= 0) {
      copyFilteredValue.splice(filterIndex, 1);
    }
    setFilteredValue(copyFilteredValue);
    if (value === 'name') {
      setNameInputValue('');
    }
    if (value === 'owner') {
      setOwnerInputValue('');
    }
    if (value === 'cloud_provider') {
      setIsStatusFilterExpanded(false);
    }
    if (value === 'region') {
      setIsRegionFilterExpanded(false);
    }
    if (value === 'status') {
      setIsStatusFilterExpanded(false);
    }
  };

  const onInputPress = (event) => {
    if (event.key === 'Enter') {
      if (event?.target?.name === 'filter names') {
        onFilter('name');
      } else if (event.target?.name === 'filter owners') {
        onFilter('owner');
      }
    }
  };

  const getSelectionForFilter = (key: string) => {
    const selectedFilters = filteredValue.filter((filter) => filter.filterKey === key);
    if (selectedFilters.length > 0) {
      switch (key) {
        case 'name':
        case 'owner':
          return selectedFilters[0].filterValue.map((val) => val.value);
        case 'region':
          return selectedFilters[0].filterValue.map((val) => val.value);
        case 'cloud_provider':
          return selectedFilters[0].filterValue.map((val) => val.value);
        case 'status':
          return selectedFilters[0].filterValue.map((val) => val.value);
        default:
          return [];
      }
    }
    return [];
  };

  const onDeleteChip = (category: string, chip: string | ToolbarChip) => {
    if (category !== 'region' && category !== 'cloud_provider') {
      const newFilteredValue: FilterType[] = Object.assign([], filteredValue);
      const filterIndex = newFilteredValue.findIndex((filter) => filter.filterKey === category);
      const prevFilterValue: FilterValue[] = Object.assign([], newFilteredValue[filterIndex]?.filterValue);
      const chipIndex = filterIndex >= 0 ? prevFilterValue.findIndex((val) => val.value === chip.toString()) : -1;
      if (chipIndex >= 0) {
        newFilteredValue[filterIndex].filterValue.splice(chipIndex, 1);
        setFilteredValue(newFilteredValue);
      }
    }
  };

  const onDeleteChipGroup = (category: string) => {
    const newFilteredValue: FilterType[] = Object.assign([], filteredValue);
    const filterIndex = newFilteredValue.findIndex((filter) => filter.filterKey === category);
    if (filterIndex >= 0) {
      newFilteredValue.splice(filterIndex, 1);
      setFilteredValue(newFilteredValue);
    }
  };

  const toggleGroupItems = (
    <>
      <ToolbarGroup variant="filter-group">
        <ToolbarItem>
          <Select
            variant={SelectVariant.single}
            aria-label="Select filter"
            onToggle={onFilterToggle}
            selections={filterSelected && filterSelected}
            isOpen={isFilterExpanded}
            onSelect={onChangeSelect}
          >
            {mainFilterOptions.map((option, index) => (
              <SelectOption isDisabled={option.disabled} key={index} value={option.value}>
                {option.label}
              </SelectOption>
            ))}
          </Select>
        </ToolbarItem>
        {/* <ToolbarFilter
          chips={getSelectionForFilter('name')}
          deleteChip={(_category, chip) => onDelete('name', chip)}
          deleteChipGroup={() => onDeleteGroup('name')}
          categoryName={t('name')}
        > */}
        {filterSelected?.toLowerCase() === 'name' && (
          <ToolbarItem>
            <InputGroup className="mk--filter-instances__toolbar--text-input">
              <TextInput
                name="filter names"
                id="filterText"
                type="search"
                aria-label="Search filter input"
                placeholder={t('filter_by_name_lower')}
                onChange={onNameInputChange}
                onKeyPress={onInputPress}
                value={nameInputValue}
              />
              <Button variant={ButtonVariant.control} onClick={() => onFilter('name')} aria-label="Search instances">
                <SearchIcon />
              </Button>
            </InputGroup>
          </ToolbarItem>
        )}
        {/* </ToolbarFilter> */}
        {/* <ToolbarFilter
          chips={getSelectionForFilter('cloud_provider')?.map((val) => t(val))}
          // deleteChip={(_category, chip) => onDelete('cloud_provider', chip)}
          // deleteChipGroup={() => onDeleteGroup('cloud_provider')}
          categoryName={t('cloud_provider')}
        > */}
        {filterSelected === 'cloud_provider' && (
          <ToolbarItem>
            <Select
              variant={SelectVariant.checkbox}
              aria-label="Select cloud provider"
              onToggle={onCloudProviderFilterToggle}
              selections={getSelectionForFilter('cloud_provider')}
              isOpen={isCloudProviderFilterExpanded}
              onSelect={onCloudProviderFilterSelect}
              placeholderText={t('filter_by_cloud_provider')}
            >
              {cloudProviderFilterOptions.map((option, index) => (
                <SelectOption isDisabled={option.disabled} key={index} value={option.value}>
                  {option.label}
                </SelectOption>
              ))}
            </Select>
          </ToolbarItem>
        )}
        {/* </ToolbarFilter> */}

        {/* <ToolbarFilter
          chips={getSelectionForFilter('region')?.map((val) => t(val))}
          // deleteChip={(_category, chip) => onDelete('region', chip)}
          // deleteChipGroup={() => onDeleteGroup('region')}
          categoryName={t('region')}
        > */}
        {filterSelected === 'region' && (
          <ToolbarItem>
            <Select
              variant={SelectVariant.checkbox}
              aria-label="Select region"
              onToggle={onRegionFilterToggle}
              selections={getSelectionForFilter('region')}
              isOpen={isRegionFilterExpanded}
              onSelect={onRegionFilterSelect}
              placeholderText={t('filter_by_region')}
            >
              {regionFilterOptions.map((option, index) => (
                <SelectOption isDisabled={option.disabled} key={index} value={option.value}>
                  {option.label}
                </SelectOption>
              ))}
            </Select>
          </ToolbarItem>
        )}
        {/* </ToolbarFilter> */}
        {/* <ToolbarFilter
          chips={getSelectionForFilter('owner')}
          deleteChip={(_category, chip) => onDelete('owner', chip)}
          deleteChipGroup={() => onDeleteGroup('owner')}
          categoryName={t('owner')}
        > */}
        {filterSelected.toLowerCase() === 'owner' && (
          <ToolbarItem>
            <InputGroup className="mk--filter-instances__toolbar--text-input">
              <TextInput
                name="filter owners"
                id="filterOwners"
                type="search"
                aria-label="Search filter input"
                placeholder={t('filter_by_owner')}
                onChange={onOwnerInputChange}
                onKeyPress={onInputPress}
                value={ownerInputValue}
              />
              <Button variant={ButtonVariant.control} onClick={() => onFilter('owner')} aria-label="Search owners">
                <SearchIcon />
              </Button>
            </InputGroup>
          </ToolbarItem>
        )}
        {/* </ToolbarFilter> */}
        {/* <ToolbarFilter
          chips={getSelectionForFilter('status')?.map((val) => t(val))}
          deleteChip={(_category, chip) => onDelete('status', chip)}
          deleteChipGroup={() => onDeleteGroup('status')}
          categoryName={t('status')}
        > */}
        {filterSelected === 'status' && (
          <ToolbarItem>
            <Select
              variant={SelectVariant.checkbox}
              aria-label="Select status"
              onToggle={onStatusFilterToggle}
              selections={getSelectionForFilter('status')}
              isOpen={isStatusFilterExpanded}
              onSelect={onStatusFilterSelect}
              placeholderText={t('filter_by_status')}
            >
              {statusFilterOptions.map((option, index) => (
                <SelectOption isDisabled={option.disabled} key={index} value={option.value}>
                  {option.label}
                </SelectOption>
              ))}
            </Select>
          </ToolbarItem>
        )}
        {/* </ToolbarFilter> */}
      </ToolbarGroup>
    </>
  );

  const toolbarChipGroup = (
    <ToolbarGroup>
      <Split hasGutter>
        {filteredValue &&
          filteredValue.map((filter: FilterType) => {
            const { filterKey, filterValue } = filter;
            if (filterKey && filterValue.length > 0) {
              return (
                <SplitItem>
                  <ChipGroup
                    key={filterKey}
                    categoryName={t(filterKey)}
                    numChips={5}
                    isClosable={filterKey != 'region' && filterKey != 'cloud_provider'}
                    onClick={() => onDeleteChipGroup(filterKey)}
                  >
                    {filterValue.map((cv) => (
                      <Chip key={cv.value} onClick={() => onDeleteChip(filter.filterKey, cv.value)}>
                        {t(cv.value)}
                      </Chip>
                    ))}
                  </ChipGroup>
                </SplitItem>
              );
            } else return <></>;
          })}
      </Split>
    </ToolbarGroup>
  );

  return (
    <Toolbar
      id="instance-toolbar"
      clearAllFilters={onClear}
      inset={{ lg: 'insetLg' }}
      collapseListedFiltersBreakpoint="md"
    >
      <ToolbarContent>
        <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="md">
          {toggleGroupItems}
        </ToolbarToggleGroup>
        <ToolbarItem>
          <Button variant="primary" onClick={() => setCreateStreamsInstance(!createStreamsInstance)}>
            {t('create_kafka_instance')}
          </Button>
        </ToolbarItem>
        <ToolbarItem variant="pagination" alignment={{ default: 'alignRight' }}>
          <TablePagination
            widgetId="pagination-options-menu-top"
            itemCount={total}
            page={page}
            perPage={perPage}
            isCompact={true}
            paginationTitle={t('minimal_pagination')}
          />
        </ToolbarItem>
      </ToolbarContent>
      <ToolbarContent>{toolbarChipGroup}</ToolbarContent>
    </Toolbar>
  );
};

export { StreamsToolbar };
